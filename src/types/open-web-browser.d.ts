declare module 'open-web-browser' {
  /**
   * 在默认浏览器中打开指定的 URL
   * @param url - 要打开的 URL 地址
   * @returns Promise<void>
   */
  export default function openWebBrowser(url: string): Promise<void>
}

