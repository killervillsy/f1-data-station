export function getOptimizedF1MediaUrl(url: string): string {
  return url
    .replace(/c_[^,/]+/g, "c_fit")
    .replace(/w_\d+/g, "w_384")
    .replace(/q_[^,/]+/g, "q_auto");
}
