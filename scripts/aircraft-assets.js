#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/aircraft/manifest.json'),'utf8'));
const APPROVED=Object.freeze({
  international:'e0e02d0872f65faf450af2411d4b31efb8258e63d1ccff545c0f02f56e8ce786',
  china:'02d9b963986c6b5470ccc4dfad25fe76697876f521c40767a7b3cf0296d32bd7'
});
const RETIRED=Object.freeze([
  'assets/qilylean-aircraft-hero-approved-20260826.png',
  'assets/qilylean-aircraft-hero-cn-v2-20260919.png',
  'assets/qilylean-aircraft-hero-v1.webp',
  'cn-site/assets/qilylean-aircraft-hero-cn-20260918.png',
  'cn-site/assets/qilylean-aircraft-hero-cn-v2-20260919.png'
]);
function assert(value,message){if(!value)throw new Error(message)}
function sha(buffer){return crypto.createHash('sha256').update(buffer).digest('hex')}
function versioned(row){return row.url+'?v='+row.sha256.slice(0,12)}
function webpDimensions(buffer){
  assert(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','Invalid aircraft WebP');
  for(let at=12;at+8<=buffer.length;){
    const size=buffer.readUInt32LE(at+4);
    if(buffer.toString('ascii',at,at+4)==='VP8L'){
      assert(buffer[at+8]===0x2f,'Aircraft derivative is not lossless WebP');
      const bits=buffer.readUInt32LE(at+9);
      return [1+(bits&0x3fff),1+((bits>>>14)&0x3fff)];
    }
    at+=8+size+(size%2);
  }
  throw new Error('Aircraft derivative has no lossless VP8L image');
}
function validate(){
  assert(manifest.version==='20261019-aircraft-refresh-v1'&&manifest.format==='webp-lossless','Aircraft delivery manifest changed unexpectedly');
  for(const [site,source] of Object.entries(manifest.sites)){
    const data=fs.readFileSync(path.join(root,source.source));
    assert(sha(data)===APPROVED[site]&&source.sha256===APPROVED[site],site+' aircraft source differs from the exact uploaded artwork');
    assert(data.length===source.bytes&&data.readUInt32BE(16)===2736&&data.readUInt32BE(20)===1536,site+' aircraft dimensions/bytes changed');
    assert(source.variants.map(row=>row.width).join(',')==='912,1824,2736','Aircraft responsive widths changed');
    for(const row of source.variants){
      const delivery=fs.readFileSync(path.join(root,row.path));
      assert(delivery.length===row.bytes&&sha(delivery)===row.sha256,'Aircraft delivery bytes differ: '+row.path);
      assert(webpDimensions(delivery).join(',')===[row.width,row.height].join(','),'Aircraft delivery dimensions differ: '+row.path);
    }
  }
  for(const file of RETIRED)assert(!fs.existsSync(path.join(root,file)),'Retired aircraft file is still present: '+file);
  return manifest;
}
function artwork(site){const row=manifest.sites[site];assert(row,'Unknown aircraft site');return row}
function pngUrl(site){const row=artwork(site);return row.source_url+'?v='+row.sha256.slice(0,12)}
function srcset(site){return artwork(site).variants.map(row=>versioned(row)+' '+row.width+'w').join(', ')}
module.exports={manifest,artwork,pngUrl,srcset,versioned,validate,RETIRED};
if(require.main===module){validate();console.log('PASS: both uploaded aircraft sources, six lossless responsive assets, exact delivery hashes, and retired-file removal.')}
