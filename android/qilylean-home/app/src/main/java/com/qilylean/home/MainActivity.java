package com.qilylean.home;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.util.Base64;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(14, 22, 18);
    private static final int CARD = Color.rgb(31, 48, 40);
    private static final int CARD_ALT = Color.rgb(26, 42, 36);
    private static final int TEAL = Color.rgb(16, 103, 119);
    private static final int GOLD = Color.rgb(222, 184, 101);
    private static final int WHITE = Color.rgb(244, 248, 246);
    private static final int MUTED = Color.rgb(181, 197, 188);

    private final Handler clockHandler = new Handler();
    private TextView clockView;
    private boolean showingApps = false;

    private final Runnable clockTask = new Runnable() {
        @Override
        public void run() {
            if (clockView != null) {
                clockView.setText(new SimpleDateFormat(
                        "HH:mm\nM月d日 EEEE", Locale.CHINA).format(new Date()));
            }
            clockHandler.postDelayed(this, 30000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        showHome();
    }

    @Override
    protected void onResume() {
        super.onResume();
        clockHandler.removeCallbacks(clockTask);
        clockHandler.post(clockTask);
    }

    @Override
    protected void onPause() {
        super.onPause();
        clockHandler.removeCallbacks(clockTask);
    }

    @Override
    public void onBackPressed() {
        if (showingApps) showHome(); else super.onBackPressed();
    }

    private void showHome() {
        showingApps = false;

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);

        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setGravity(Gravity.CENTER_HORIZONTAL);
        content.setPadding(dp(20), dp(24), dp(20), dp(40));
        scroll.addView(content, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        ImageView logo = new ImageView(this);
        logo.setAdjustViewBounds(true);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        Bitmap logoBitmap = loadLogo();
        if (logoBitmap != null) logo.setImageBitmap(logoBitmap);
        content.addView(logo, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(108)));

        TextView tagline = text("精益生产 · 工程改善 · 数智工厂", 15, GOLD, Gravity.CENTER);
        tagline.setPadding(0, dp(4), 0, dp(14));
        content.addView(tagline);

        clockView = text("", 32, WHITE, Gravity.CENTER);
        clockView.setTypeface(Typeface.create("sans", Typeface.NORMAL));
        clockView.setLineSpacing(dp(3), 1f);
        content.addView(clockView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
        clockHandler.removeCallbacks(clockTask);
        clockHandler.post(clockTask);

        TextView version = pill("QilyLean Home v2.0 · 官网全导航通用版");
        LinearLayout.LayoutParams versionLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        versionLp.setMargins(0, dp(14), 0, dp(20));
        content.addView(version, versionLp);

        addSectionTitle(content, "官网首页导航");
        addCardRow(content,
                webCard("首页", "官网总入口与最新内容", "https://qilylean.com/"),
                webCard("能力画像", "方法体系、能力域与佐证", "https://qilylean.com/capabilities/"));
        addCardRow(content,
                webCard("履历主线", "制造业经历与岗位主线", "https://qilylean.com/experience/"),
                webCard("代表项目", "精益、IE与数智工厂案例", "https://qilylean.com/projects/"));
        addCardRow(content,
                webCard("改善经验", "现场改善方法与工程沉淀", "https://qilylean.com/improvements/"),
                webCard("QilyLean AI", "通用智能与专业对话", "https://qilylean.com/ai.html"));
        addCardRow(content,
                webCard("知识分享", "工具、简报与参考资料", "https://qilylean.com/knowledge/"),
                webCard("行走印记", "工作现场、团队与生活记录", "https://qilylean.com/moments.html"));
        addCardRow(content,
                webCard("项目合作", "诊断、规划与项目交付", "https://qilylean.com/cooperation/"),
                webCard("今日简报", "制造工程方法持续沉淀", "https://qilylean.com/qilylean/daily-insights.html"));

        addSectionTitle(content, "知识重点直达");
        addCardRow(content,
                webCard("全站术语", "中文诠释与应用场景", "https://qilylean.com/knowledge/terminology.html"),
                webCard("友情链接", "全球科技与制造资源入口", "https://qilylean.com/links/"));

        addSectionTitle(content, "通用快捷管理");
        addCardRow(content,
                cardAlt("网络与互联网", "Wi-Fi、移动网络与热点", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_WIRELESS_SETTINGS); }
                }),
                cardAlt("电池管理", "电量、节能与后台使用", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_BATTERY_SAVER_SETTINGS); }
                }));
        addCardRow(content,
                cardAlt("显示设置", "亮度、护眼与屏幕显示", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_DISPLAY_SETTINGS); }
                }),
                cardAlt("声音与振动", "铃声、媒体与通知音量", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_SOUND_SETTINGS); }
                }));
        addCardRow(content,
                cardAlt("壁纸设置", "应用QilyLean品牌壁纸", new View.OnClickListener() {
                    @Override public void onClick(View v) { openWallpaperSettings(); }
                }),
                cardAlt("应用管理", "权限、通知与存储管理", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_APPLICATION_SETTINGS); }
                }));
        addCardRow(content,
                cardAlt("安全设置", "锁屏、凭据与设备安全", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_SECURITY_SETTINGS); }
                }),
                cardAlt("语言与输入", "语言、键盘与输入法", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_INPUT_METHOD_SETTINGS); }
                }));

        addSectionTitle(content, "系统入口");
        addCardRow(content,
                card("全部应用", "打开本机应用抽屉", new View.OnClickListener() {
                    @Override public void onClick(View v) { showAppDrawer(); }
                }),
                card("系统设置", "进入Android系统设置", new View.OnClickListener() {
                    @Override public void onClick(View v) { openSettings(Settings.ACTION_SETTINGS); }
                }));
        addCardRow(content,
                card("默认桌面", "设置或切换桌面应用", new View.OnClickListener() {
                    @Override public void onClick(View v) { openHomeSettings(); }
                }),
                webCard("官网搜索", "进入官网并使用全站搜索", "https://qilylean.com/"));

        TextView footer = text(
                "启精益之智，聚企业之力。\n免Root通用版，不读取、不展示手机品牌或型号。",
                12, MUTED, Gravity.CENTER);
        footer.setLineSpacing(dp(2), 1f);
        LinearLayout.LayoutParams footerLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        footerLp.setMargins(0, dp(24), 0, 0);
        content.addView(footer, footerLp);

        setContentView(scroll);
    }

    private View webCard(String title, String subtitle, final String url) {
        return card(title, subtitle, new View.OnClickListener() {
            @Override public void onClick(View v) { openUrl(url); }
        });
    }

    private void showAppDrawer() {
        showingApps = true;
        final PackageManager pm = getPackageManager();
        Intent query = new Intent(Intent.ACTION_MAIN, null);
        query.addCategory(Intent.CATEGORY_LAUNCHER);
        final List<ResolveInfo> apps = new ArrayList<>(pm.queryIntentActivities(query, 0));
        Collections.sort(apps, new Comparator<ResolveInfo>() {
            @Override public int compare(ResolveInfo a, ResolveInfo b) {
                return a.loadLabel(pm).toString().compareToIgnoreCase(b.loadLabel(pm).toString());
            }
        });

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        root.setPadding(dp(16), dp(18), dp(16), dp(10));

        TextView back = text("‹  返回 QilyLean Home", 18, GOLD,
                Gravity.LEFT | Gravity.CENTER_VERTICAL);
        back.setTypeface(Typeface.DEFAULT_BOLD);
        back.setPadding(dp(8), dp(10), dp(8), dp(16));
        back.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { showHome(); }
        });
        root.addView(back, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        GridView grid = new GridView(this);
        grid.setNumColumns(4);
        grid.setVerticalSpacing(dp(18));
        grid.setHorizontalSpacing(dp(8));
        grid.setStretchMode(GridView.STRETCH_COLUMN_WIDTH);
        grid.setGravity(Gravity.CENTER);
        grid.setAdapter(new AppAdapter(this, apps, pm));
        grid.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                ResolveInfo info = apps.get(position);
                Intent launch = pm.getLaunchIntentForPackage(info.activityInfo.packageName);
                if (launch != null) startActivity(launch);
            }
        });
        root.addView(grid, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);
    }

    private void addSectionTitle(LinearLayout parent, String title) {
        TextView view = text(title, 17, WHITE, Gravity.LEFT);
        view.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(dp(2), dp(12), 0, dp(8));
        parent.addView(view, lp);
    }

    private void addCardRow(LinearLayout parent, View left, View right) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams rowLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        rowLp.setMargins(0, 0, 0, dp(10));
        parent.addView(row, rowLp);

        LinearLayout.LayoutParams leftLp = new LinearLayout.LayoutParams(0, dp(92), 1f);
        leftLp.setMargins(0, 0, dp(5), 0);
        row.addView(left, leftLp);
        LinearLayout.LayoutParams rightLp = new LinearLayout.LayoutParams(0, dp(92), 1f);
        rightLp.setMargins(dp(5), 0, 0, 0);
        row.addView(right, rightLp);
    }

    private View card(String title, String subtitle, View.OnClickListener listener) {
        return buildCard(title, subtitle, CARD, listener);
    }

    private View cardAlt(String title, String subtitle, View.OnClickListener listener) {
        return buildCard(title, subtitle, CARD_ALT, listener);
    }

    private View buildCard(String title, String subtitle, int fill, View.OnClickListener listener) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_VERTICAL);
        box.setPadding(dp(14), dp(9), dp(10), dp(9));
        box.setClickable(true);
        box.setFocusable(true);
        box.setElevation(dp(2));
        box.setBackground(roundRect(fill, 16, TEAL, 1));
        box.setOnClickListener(listener);

        TextView titleView = text(title, 16, WHITE, Gravity.LEFT);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        box.addView(titleView);
        TextView subView = text(subtitle, 10, MUTED, Gravity.LEFT);
        subView.setMaxLines(2);
        LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        subLp.setMargins(0, dp(4), 0, 0);
        box.addView(subView, subLp);
        return box;
    }

    private TextView pill(String value) {
        TextView view = text(value, 11, GOLD, Gravity.CENTER);
        view.setPadding(dp(12), dp(7), dp(12), dp(7));
        view.setBackground(roundRect(Color.rgb(28, 43, 36), 20, GOLD, 1));
        return view;
    }

    private TextView text(String value, int sp, int color, int gravity) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        view.setTextColor(color);
        view.setGravity(gravity);
        return view;
    }

    private GradientDrawable roundRect(int fill, int radiusDp, int stroke, int strokeDp) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(dp(radiusDp));
        drawable.setStroke(dp(strokeDp), stroke);
        return drawable;
    }

    private Bitmap loadLogo() {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                    getAssets().open("qilylean_logo.b64"), "UTF-8"));
            StringBuilder data = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) data.append(line.trim());
            reader.close();
            byte[] bytes = Base64.decode(data.toString(), Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        } catch (Exception e) {
            Toast.makeText(this, "LOGO资源读取失败", Toast.LENGTH_SHORT).show();
            return null;
        }
    }

    private void openUrl(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "未找到可用浏览器", Toast.LENGTH_SHORT).show();
        }
    }

    private void openSettings(String action) {
        try {
            startActivity(new Intent(action));
        } catch (ActivityNotFoundException e) {
            startActivity(new Intent(Settings.ACTION_SETTINGS));
        }
    }

    private void openWallpaperSettings() {
        try {
            startActivity(new Intent(Intent.ACTION_SET_WALLPAPER));
        } catch (ActivityNotFoundException e) {
            openSettings(Settings.ACTION_DISPLAY_SETTINGS);
        }
    }

    private void openHomeSettings() {
        try {
            startActivity(new Intent(Settings.ACTION_HOME_SETTINGS));
        } catch (ActivityNotFoundException e) {
            try {
                startActivity(new Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS));
            } catch (ActivityNotFoundException ignored) {
                startActivity(new Intent(Settings.ACTION_SETTINGS));
            }
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private static class AppAdapter extends BaseAdapter {
        private final Context context;
        private final List<ResolveInfo> apps;
        private final PackageManager pm;

        AppAdapter(Context context, List<ResolveInfo> apps, PackageManager pm) {
            this.context = context;
            this.apps = apps;
            this.pm = pm;
        }

        @Override public int getCount() { return apps.size(); }
        @Override public Object getItem(int position) { return apps.get(position); }
        @Override public long getItemId(int position) { return position; }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            ResolveInfo info = apps.get(position);
            LinearLayout item = new LinearLayout(context);
            item.setOrientation(LinearLayout.VERTICAL);
            item.setGravity(Gravity.CENTER);
            item.setPadding(4, 8, 4, 8);

            ImageView icon = new ImageView(context);
            icon.setImageDrawable(info.loadIcon(pm));
            icon.setScaleType(ImageView.ScaleType.FIT_CENTER);
            item.addView(icon, new LinearLayout.LayoutParams(
                    dpStatic(context, 52), dpStatic(context, 52)));

            TextView label = new TextView(context);
            label.setText(info.loadLabel(pm));
            label.setTextColor(WHITE);
            label.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            label.setGravity(Gravity.CENTER);
            label.setMaxLines(2);
            LinearLayout.LayoutParams labelLp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            labelLp.setMargins(0, dpStatic(context, 5), 0, 0);
            item.addView(label, labelLp);
            return item;
        }

        private static int dpStatic(Context context, int value) {
            return Math.round(value * context.getResources().getDisplayMetrics().density);
        }
    }
}
