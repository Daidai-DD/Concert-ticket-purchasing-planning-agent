declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ZHIPU_API_KEY?: string;
    ZHIPU_MODEL?: string;
    QWEN_API_KEY?: string;
    QWEN_MODEL?: string;
    QWEN_BASE_URL?: string;
    BAIDU_MAP_AK?: string;
    TICKETMASTER_API_KEY?: string;
  }
}
