import Link from "next/link";

const currentYear = 2026;

export default function Footer() {
  return (
    <footer className="bg-footer-bg border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 sm:gap-5">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-text-primary">
                F1<span className="text-f1-red">.</span>Data
              </span>
            </Link>
            <p className="text-text-subtle text-sm">
              F1 数据站，追踪赛事、积分榜、赛程、车手、车队和官方实时计时。
            </p>
          </div>

          <div>
            <h4 className="text-text-primary font-medium mb-3">导航</h4>
            <ul className="space-y-1.5">
              {[
                ["/schedule", "赛程"],
                ["/standings", "积分榜"],
                ["/drivers", "车手"],
                ["/constructors", "车队"],
                ["/live", "实时数据"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-text-muted hover:text-text-primary text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-medium mb-3">数据来源</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://api.jolpi.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary text-sm"
                >
                  Jolpica API
                </a>
              </li>
              <li>
                <a
                  href="https://www.formula1.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary text-sm"
                >
                  F1 Live Timing / Formula 1
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-medium mb-3">社区</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://discord.gg/y6zK5JvAn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm"
                >
                  <svg aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-white p-0.5" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37A19.8 19.8 0 0 0 15.37 2.84a.07.07 0 0 0-.074.035c-.214.38-.452.875-.619 1.265a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.628-1.265.08.08 0 0 0-.074-.035A19.7 19.7 0 0 0 3.54 4.37a.06.06 0 0 0-.032.027C.533 8.844-.28 13.18.12 17.46a.08.08 0 0 0 .031.055 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.027 14 14 0 0 0 1.226-1.994.08.08 0 0 0-.043-.106 13 13 0 0 1-1.872-.892.08.08 0 0 1-.008-.128q.189-.14.371-.287a.07.07 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .078.009q.182.149.373.288a.08.08 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.893.08.08 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-4.95-.838-9.25-3.549-13.066a.06.06 0 0 0-.031-.028M8.02 14.846c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.42-2.157 2.42m7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.42-2.157 2.42" />
                  </svg>
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/f1datac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm"
                >
                  <svg aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-white p-0.5" viewBox="0 0 24 24" fill="#26A5E4">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0m4.962 7.224c.14-.002.453.032.655.196.169.139.216.326.239.458.022.132.05.433.028.668-.256 2.695-1.365 9.236-1.928 12.255-.239 1.277-.708 1.706-1.162 1.748-.987.091-1.736-.652-2.691-1.277-1.494-.98-2.338-1.59-3.789-2.546-1.676-1.104-.59-1.71.365-2.702.25-.26 4.596-4.213 4.68-4.572.01-.045.02-.212-.079-.3-.098-.087-.244-.057-.349-.033-.148.034-2.512 1.594-7.09 4.68-.67.46-1.277.684-1.822.672-.6-.013-1.756-.34-2.614-.619-1.053-.342-1.89-.523-1.817-1.104.038-.302.454-.612 1.248-.933 4.894-2.132 8.157-3.538 9.79-4.219 4.66-1.94 5.63-2.277 6.256-2.287" />
                  </svg>
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://www.reddit.com/r/f1data/s/Tvaw7EYhxA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm"
                >
                  <svg aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-white p-0.5" viewBox="0 0 24 24" fill="#FF4500">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0m5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614.052.251.083.511.083.774 0 2.833-3.167 5.126-7.07 5.126s-7.07-2.293-7.07-5.126c0-.263.031-.523.083-.774A1.75 1.75 0 0 1 4 12c0-.968.786-1.754 1.754-1.754.477 0 .899.182 1.207.491 1.198-.859 2.856-1.419 4.684-1.488l.921-4.324a.57.57 0 0 1 .669-.442l3.04.646c.213-.232.518-.385.735-.385M8.5 13.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m7 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5m-6.15 4.07a.5.5 0 0 0-.25.94c.73.466 1.724.69 2.9.69 1.177 0 2.17-.224 2.9-.69a.5.5 0 1 0-.538-.842c-.55.352-1.358.532-2.362.532s-1.812-.18-2.362-.532a.5.5 0 0 0-.288-.098" />
                  </svg>
                  Reddit
                </a>
              </li>
              <li>
                <a
                  href="https://ig.me/j/AbZd_xQkof68MUQp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm"
                >
                  <svg aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-white p-0.5" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2m0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6m5.25-2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5" />
                  </svg>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-5 pt-5 text-center">
          <p className="text-text-subtle text-sm">
            © {currentYear} F1 数据站。数据来源: Jolpica API 和 F1 Live Timing.
          </p>
          <p className="text-text-subtle text-xs mt-2">
            本站非官方站点，仅供学习交流使用。
          </p>
        </div>
      </div>
    </footer>
  );
}
