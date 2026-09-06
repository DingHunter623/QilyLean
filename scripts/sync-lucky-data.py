#!/usr/bin/env python3
"""Sync Lucky Data from official China Sports Lottery / China Welfare Lottery public endpoints."""
from __future__ import annotations
import argparse,json,os,re,subprocess,tempfile,time
from datetime import datetime,timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
ROOT=Path(__file__).resolve().parents[1]
DATA_DIR=ROOT/'tools'/'lucky-data'/'data'
USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0 Safari/537.36 LuckyData/1.0'
PAGE_SIZE=100
SLEEP_SECONDS=.18
GAMES={
'dlt':{'label':'超级大乐透','source_name':'中国体育彩票','source_homepage':'https://www.lottery.gov.cn/','source_type':'sporttery','min_complete':1000},
'ssq':{'label':'双色球','source_name':'中国福利彩票','source_homepage':'https://www.cwl.gov.cn/','source_type':'cwl','cwl_name':'ssq','referer':'https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/','min_complete':1000},
'kl8':{'label':'快乐8','source_name':'中国福利彩票','source_homepage':'https://www.cwl.gov.cn/','source_type':'cwl','cwl_name':'kl8','referer':'https://www.cwl.gov.cn/ygkj/wqkjgg/kl8/','min_complete':500},
'fc3d':{'label':'福彩3D','source_name':'中国福利彩票','source_homepage':'https://www.cwl.gov.cn/','source_type':'cwl','cwl_name':'3d','referer':'https://www.cwl.gov.cn/ygkj/wqkjgg/3d/','min_complete':1000}}
def curl_json(url:str,*,referer:str='',cookie_jar:str='',save_cookie:bool=False)->dict[str,Any]:
 cmd=['curl','-fsSL','--retry','3','--retry-delay','1','--connect-timeout','12','--max-time','40','-A',USER_AGENT,'-H','Accept: application/json, text/plain, */*','-H','Accept-Language: zh-CN,zh;q=0.9,en;q=0.6','-H','Cache-Control: no-cache']
 if referer:cmd+=['-e',referer]
 if cookie_jar:
  cmd+=['-b',cookie_jar]
  if save_cookie:cmd+=['-c',cookie_jar]
 cmd.append(url);raw=subprocess.check_output(cmd,text=True)
 try:value=json.loads(raw)
 except json.JSONDecodeError as exc:raise RuntimeError(f'Official endpoint returned non-JSON content: {url}: {raw[:160]!r}') from exc
 if not isinstance(value,dict):raise RuntimeError(f'Official endpoint returned unexpected payload: {url}')
 return value
def warm_cwl_cookie(referer:str,cookie_jar:str)->None:
 cmd=['curl','-fsSL','--retry','3','--retry-delay','1','--connect-timeout','12','--max-time','40','-A',USER_AGENT,'-H','Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','-c',cookie_jar,referer];subprocess.check_output(cmd,text=True)
def split_numbers(value:Any)->list[str]:
 if value is None:return []
 parts=value if isinstance(value,list) else re.split(r'[\s,，、;；|/+\-]+',str(value).strip());out=[]
 for part in parts:
  text=str(part).strip();m=re.search(r'\d+',text)
  if text and m:out.append(m.group(0))
 return out
def integer(value:Any)->int|None:
 if value is None or value=='':return None
 text=re.sub(r'[^0-9.-]','',str(value))
 try:return int(float(text)) if text else None
 except ValueError:return None
def money(value:Any)->float|int|None:
 if value is None or value=='':return None
 text=re.sub(r'[^0-9.-]','',str(value))
 try:number=float(text)
 except ValueError:return None
 return int(number) if number.is_integer() else number
def normalize_prizes(items:Any)->list[dict[str,Any]]:
 if not isinstance(items,list):return []
 result=[]
 for item in items:
  if not isinstance(item,dict):continue
  level=str(item.get('type') or item.get('prizeName') or item.get('name') or item.get('level') or '').strip();count=integer(item.get('typenum') if 'typenum' in item else item.get('count') or item.get('stakeCount'));amount=money(item.get('typemoney') if 'typemoney' in item else item.get('amount') or item.get('stakeAmount'))
  if level or count is not None or amount is not None:result.append({'level':level,'count':count,'amount':amount})
 return result
def normalize_date(value:Any)->str:
 text=str(value or '').strip();m=re.search(r'(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})',text)
 return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}' if m else text[:10]
def normalize_cwl(game:str,row:dict[str,Any])->dict[str,Any]|None:
 issue=str(row.get('code') or row.get('issue') or row.get('lotteryDrawNum') or '').strip()
 if not issue:return None
 red=split_numbers(row.get('red'));blue=split_numbers(row.get('blue'))
 if game=='ssq':primary,secondary=red[:6],blue[:1]
 elif game=='kl8':primary,secondary=red[:20],[]
 else:primary,secondary=red[:3],[]
 if not primary:return None
 official_url=str(row.get('url') or row.get('detailsUrl') or '').strip()
 if official_url.startswith('/'):official_url='https://www.cwl.gov.cn'+official_url
 return {'issue':issue,'date':normalize_date(row.get('date')),'primary':primary,'secondary':secondary,'sales':money(row.get('sales')),'pool':money(row.get('poolmoney') or row.get('poolMoney')),'prizes':normalize_prizes(row.get('prizegrades') or row.get('prizeGrades')),'officialUrl':official_url or 'https://www.cwl.gov.cn/'}
def normalize_dlt(row:dict[str,Any])->dict[str,Any]|None:
 issue=str(row.get('lotteryDrawNum') or row.get('issue') or '').strip();values=split_numbers(row.get('lotteryDrawResult') or row.get('drawResult') or row.get('result'))
 if not issue or len(values)<7:return None
 official_url=str(row.get('lotteryDrawUrl') or row.get('url') or '').strip()
 if official_url.startswith('/'):official_url='https://www.lottery.gov.cn'+official_url
 return {'issue':issue,'date':normalize_date(row.get('lotteryDrawTime') or row.get('date')),'primary':values[:5],'secondary':values[5:7],'sales':money(row.get('totalSaleAmount') or row.get('sales')),'pool':money(row.get('poolBalanceAfterdraw') or row.get('poolBalanceAfterDraw') or row.get('pool')),'prizes':normalize_prizes(row.get('prizeLevelList') or row.get('prizegrades') or row.get('prizeGrades')),'officialUrl':official_url or 'https://www.lottery.gov.cn/'}
def cwl_result(payload:dict[str,Any])->list[dict[str,Any]]:
 candidates=[payload.get('result'),(payload.get('data') or {}).get('result') if isinstance(payload.get('data'),dict) else None,(payload.get('value') or {}).get('list') if isinstance(payload.get('value'),dict) else None]
 for candidate in candidates:
  if isinstance(candidate,list):return [x for x in candidate if isinstance(x,dict)]
 return []
def dlt_result(payload:dict[str,Any])->list[dict[str,Any]]:
 value=payload.get('value')
 if isinstance(value,dict) and isinstance(value.get('list'),list):return [x for x in value['list'] if isinstance(x,dict)]
 if isinstance(payload.get('data'),list):return [x for x in payload['data'] if isinstance(x,dict)]
 return []
def fetch_dlt(full:bool)->tuple[list[dict[str,Any]],bool,str]:
 rows=[];max_pages=120 if full else 5;complete=False;warning=''
 for page in range(1,max_pages+1):
  query=urlencode({'gameNo':'85','provinceId':'0','pageSize':PAGE_SIZE,'isVerify':'1','pageNo':page});url='https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?'+query
  try:payload=curl_json(url,referer='https://www.lottery.gov.cn/')
  except Exception as exc:warning=f'大乐透官方接口在第{page}页中断: {exc}';break
  page_rows=dlt_result(payload)
  if not page_rows:complete=True;break
  rows.extend(x for x in (normalize_dlt(r) for r in page_rows) if x)
  if len(page_rows)<PAGE_SIZE:complete=True;break
  time.sleep(SLEEP_SECONDS)
 return rows,complete,warning
def fetch_cwl(game:str,full:bool)->tuple[list[dict[str,Any]],bool,str]:
 cfg=GAMES[game];rows=[];max_pages=120 if full else 5;complete=False;warning=''
 with tempfile.NamedTemporaryFile(prefix=f'lucky-{game}-',suffix='.cookies',delete=False) as handle:cookie_jar=handle.name
 try:
  try:warm_cwl_cookie(cfg['referer'],cookie_jar)
  except Exception as exc:warning=f"{cfg['label']}官方页面Cookie预热失败: {exc}"
  for page in range(1,max_pages+1):
   query=urlencode({'name':cfg['cwl_name'],'issueCount':'','issueStart':'','issueEnd':'','dayStart':'','dayEnd':'','pageNo':page,'pageSize':PAGE_SIZE,'systemType':'PC'});url='https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?'+query
   try:payload=curl_json(url,referer=cfg['referer'],cookie_jar=cookie_jar,save_cookie=True)
   except Exception as exc:warning=f"{cfg['label']}官方接口在第{page}页中断: {exc}";break
   page_rows=cwl_result(payload)
   if not page_rows and page==1:
    try:warm_cwl_cookie(cfg['referer'],cookie_jar);payload=curl_json(url,referer=cfg['referer'],cookie_jar=cookie_jar,save_cookie=True);page_rows=cwl_result(payload)
    except Exception:page_rows=[]
   if not page_rows:complete=page>1;break
   rows.extend(x for x in (normalize_cwl(game,r) for r in page_rows) if x)
   if len(page_rows)<PAGE_SIZE:complete=True;break
   time.sleep(SLEEP_SECONDS)
 finally:
  try:os.unlink(cookie_jar)
  except OSError:pass
 return rows,complete,warning
def load_existing(game:str)->dict[str,Any]:
 path=DATA_DIR/f'{game}.json'
 if not path.exists():return {}
 try:value=json.loads(path.read_text(encoding='utf-8'));return value if isinstance(value,dict) else {}
 except Exception:return {}
def issue_key(issue:Any)->tuple[int,str]:
 text=str(issue or '');digits=re.sub(r'\D','',text);return (int(digits) if digits else -1,text)
def merge_records(old:list[dict[str,Any]],new:list[dict[str,Any]])->list[dict[str,Any]]:
 merged={}
 for row in old+new:
  issue=str(row.get('issue') or '').strip()
  if issue:merged[issue]=row
 return sorted(merged.values(),key=lambda row:issue_key(row.get('issue')),reverse=True)
def write_game(game:str,rows:list[dict[str,Any]],endpoint_complete:bool,warning:str,requested_full:bool)->None:
 cfg=GAMES[game];old=load_existing(game);old_rows=old.get('draws') if isinstance(old.get('draws'),list) else [];merged=merge_records(old_rows,rows);history_complete=bool(endpoint_complete and requested_full and len(merged)>=cfg['min_complete'])
 if old.get('historyComplete') is True and not requested_full:history_complete=True
 generated=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z');payload={'schemaVersion':1,'game':game,'gameName':cfg['label'],'sourceName':cfg['source_name'],'sourceHomepage':cfg['source_homepage'],'generatedAt':generated,'recordCount':len(merged),'historyComplete':history_complete,'syncWarning':warning,'draws':merged};DATA_DIR.mkdir(parents=True,exist_ok=True);(DATA_DIR/f'{game}.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8');print(f'{game}: fetched={len(rows)} merged={len(merged)} complete={history_complete} warning={warning!r}')
def sync_game(game:str,force_full:bool)->None:
 existing=load_existing(game);full=force_full or not existing or existing.get('historyComplete') is not True
 if GAMES[game]['source_type']=='sporttery':rows,complete,warning=fetch_dlt(full)
 else:rows,complete,warning=fetch_cwl(game,full)
 if not rows and not existing.get('draws'):raise RuntimeError(f'{game}: official source returned no draw records')
 write_game(game,rows,complete,warning,full)
def main()->int:
 parser=argparse.ArgumentParser();parser.add_argument('--full',action='store_true');parser.add_argument('--game',choices=list(GAMES),action='append');args=parser.parse_args();games=args.game or list(GAMES);failures=[]
 for game in games:
  try:sync_game(game,args.full)
  except Exception as exc:failures.append(f'{game}: {exc}');print(f'ERROR {game}: {exc}')
 if failures:raise SystemExit('; '.join(failures))
 return 0
if __name__=='__main__':raise SystemExit(main())
