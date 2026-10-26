import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { getCookie, setCookie } from "hono/cookie";
import { parse as parseCookie } from "cookie";

const COOKIE_NAME = "yijianji_access";
const PASSWORD_SHA256 =
  "afdcba2e170f8107dd68c4227dbbbf0bc44c7b9ae55506ca331c5c168840ee80";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const ACCESS_TOKEN = createHmac("sha256", PASSWORD_SHA256)
  .update("yijianji-access-v1")
  .digest("hex");

function matches(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isAuthorized(cookie?: string) {
  return Boolean(cookie && matches(cookie, ACCESS_TOKEN));
}

export function hasValidAccessCookie(cookieHeader?: string) {
  const cookies = parseCookie(cookieHeader ?? "");
  return isAuthorized(cookies[COOKIE_NAME]);
}

function isLocalhost(headers: Headers) {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function loginPage(hasError = false) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>访问验证 · 一剑击</title>
  <style>
    :root{color-scheme:light;--ink:#172a27;--muted:#64736f;--line:#dce4df;--paper:#f4f7f4;--card:#fff;--green:#174f43;--green-hover:#103d33;--error:#a33232}
    *{box-sizing:border-box}body{margin:0;min-width:320px;background:var(--paper);color:var(--ink);font-family:"PingFang SC","Microsoft YaHei",sans-serif;font-size:16px;line-height:1.6}
    main{min-height:100dvh;display:grid;grid-template-columns:minmax(280px,1fr) minmax(360px,520px);align-items:stretch}
    .story{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:56px clamp(32px,7vw,104px);background:#183f37;color:#f2f6f2}
    .story:after{content:"";position:absolute;right:-100px;bottom:-180px;width:460px;height:460px;border:1px solid #ffffff24;border-radius:50%;box-shadow:0 0 0 72px #ffffff08,0 0 0 144px #ffffff05;pointer-events:none}
    .brand{position:relative;z-index:1;display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;letter-spacing:.08em}.brand small{display:block;font-size:10px;font-weight:500;letter-spacing:.18em;opacity:.68}
    .mark{display:grid;place-items:center;width:42px;height:42px;border:1px solid #ffffff40;border-radius:12px;font-size:22px}.story-copy{position:relative;z-index:1;max-width:520px}.eyebrow{font-size:11px;letter-spacing:.2em;opacity:.65}.story h1{margin:18px 0;font-family:"Songti SC","SimSun",serif;font-size:clamp(36px,4.4vw,62px);font-weight:600;line-height:1.2;letter-spacing:.03em}.story p{max-width:38ch;margin:0;color:#d7e1dc;font-size:16px}
    .gate{display:flex;align-items:center;justify-content:center;padding:48px 40px;background:var(--card)}.panel{width:100%;max-width:360px}.lock{display:grid;place-items:center;width:46px;height:46px;margin-bottom:28px;border-radius:14px;background:#e8f0ec;color:var(--green)}
    h2{margin:0 0 8px;font-size:28px;line-height:1.35;letter-spacing:.02em}.intro{margin:0 0 32px;color:var(--muted)}label{display:block;margin-bottom:8px;font-size:14px;font-weight:600}
    input{width:100%;height:50px;padding:0 15px;border:1px solid var(--line);border-radius:10px;background:#fbfcfb;color:var(--ink);font:inherit;font-size:18px;letter-spacing:.16em;outline:none;transition:border-color .18s,box-shadow .18s}input:focus{border-color:#4e7b70;box-shadow:0 0 0 3px #174f4318}
    button{width:100%;min-height:48px;margin-top:18px;border:0;border-radius:10px;background:var(--green);color:#fff;font:inherit;font-weight:600;cursor:pointer;transition:background .18s,transform .18s}button:hover{background:var(--green-hover)}button:active{transform:translateY(1px)}button:focus-visible{outline:3px solid #77a398;outline-offset:3px}
    .error{margin:16px 0 0;padding:11px 13px;border-radius:8px;background:#fff0f0;color:var(--error);font-size:14px}.note{margin:24px 0 0;color:var(--muted);font-size:13px;text-align:center}
    @media(max-width:760px){main{display:block}.story{min-height:210px;padding:28px 24px}.story-copy{margin-top:38px}.story h1{margin:10px 0 0;font-size:32px}.story p,.story .eyebrow{display:none}.story:after{width:260px;height:260px;right:-120px;bottom:-180px}.gate{min-height:calc(100dvh - 210px);padding:40px 24px}.lock{margin-bottom:22px}h2{font-size:25px}}
    @media(prefers-reduced-motion:reduce){input,button{transition:none}}
  </style>
</head>
<body>
  <main>
    <section class="story" aria-label="一剑击">
      <div class="brand"><span class="mark" aria-hidden="true"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 17.5-11-11V3h3.5l11 11"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="m9.5 6.5 11 11V21h-3.5l-11-11"/><path d="m5 14 6 6"/><path d="m7 17-4 4"/><path d="m3 19 2 2"/></svg></span><span>一剑击<small>DEFENCING CLUB</small></span></div>
      <div class="story-copy"><span class="eyebrow">PRIVATE WORKSPACE</span><h1>每一剑，<br/>都有成长的路径。</h1><p>俱乐部内部工作台。验证访问口令后，继续查看训练与成长记录。</p></div>
    </section>
    <section class="gate">
      <form class="panel" action="/access/login" method="post">
        <div class="lock" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="11" x="5" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
        <h2>需要访问口令</h2><p class="intro">此网站仅限授权访问，请输入口令继续。</p>
        <label for="password">访问口令</label>
        <input id="password" name="password" type="password" inputmode="numeric" autocomplete="current-password" maxlength="64" placeholder="请输入口令" required autofocus />
        ${hasError ? '<div class="error" role="alert">口令不正确，请重新输入。</div>' : ""}
        <button type="submit">验证并进入网站</button>
        <p class="note">验证通过后，此浏览器将保持访问状态 7 天。</p>
      </form>
    </section>
  </main>
</body>
</html>`;
}

export const accessRoutes = new Hono();

accessRoutes.post(
  "/login",
  bodyLimit({ maxSize: 2 * 1024, onError: c => c.body(null, 413) }),
  async c => {
    const body = await c.req.parseBody();
    const password = typeof body.password === "string" ? body.password : "";
    const passwordHash = createHash("sha256").update(password).digest("hex");

    if (!matches(passwordHash, PASSWORD_SHA256)) {
      await new Promise(resolve => setTimeout(resolve, 350));
      c.header("Cache-Control", "no-store");
      return c.html(loginPage(true), 401);
    }

    setCookie(c, COOKIE_NAME, ACCESS_TOKEN, {
      httpOnly: true,
      secure: !isLocalhost(c.req.raw.headers),
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return c.redirect("/", 303);
  }
);

export const requireAccess: MiddlewareHandler = async (c, next) => {
  if (isAuthorized(getCookie(c, COOKIE_NAME))) {
    await next();
    return;
  }

  c.header("Cache-Control", "no-store");
  c.header("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (c.req.path.startsWith("/api/") || c.req.method !== "GET") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // The login page itself is a healthy response. Platform preview/publish
  // readiness checks treat a 401 at / as a failed server and restart it.
  return c.html(loginPage());
};
