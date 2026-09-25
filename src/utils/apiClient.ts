/**
 * Helper utility for robust API fetching and error handling.
 * Specifically handles cases where proxies or servers return HTML/text error pages
 * such as "The page cannot be loaded" or "The page could not be displayed",
 * preventing SyntaxError: "Unexpected token 'T', "The page c"... is not valid JSON".
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
  fromCache?: boolean;
  [key: string]: any;
}

export class ApiError extends Error {
  statusCode: number;
  isHtmlOrProxyError: boolean;
  originalText?: string;

  constructor(message: string, statusCode = 0, isHtmlOrProxyError = false, originalText?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isHtmlOrProxyError = isHtmlOrProxyError;
    this.originalText = originalText;
  }
}

/**
 * Checks if a string or error indicates a non-JSON / HTML / Cloud proxy error
 * specifically targeting "Unexpected token 'T', 'The page c'... is not valid JSON"
 */
export function isPageNotJsonError(errOrText: any): boolean {
  if (!errOrText) return false;
  const str = typeof errOrText === 'string' ? errOrText : (errOrText.message || String(errOrText));
  return (
    str.includes("Unexpected token 'T'") ||
    str.includes('The page c') ||
    str.includes('The page could not') ||
    str.includes('The page cannot') ||
    str.includes('is not valid JSON') ||
    str.includes('<!DOCTYPE html>') ||
    str.includes('<html')
  );
}

/**
 * Normalizes error message for friendly display to users in Thai
 */
export function formatFriendlyErrorMessage(err: any): string {
  if (!err) return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

  const errMsg = err?.message || String(err);

  if (isPageNotJsonError(errMsg)) {
    return (
      'เซิร์ฟเวอร์หรือ Cloud Proxy ตอบสนองด้วยหน้าเว็บชั่วคราว ' +
      '("The page cannot be loaded..." / 502 Bad Gateway) แทนที่จะเป็นข้อมูล JSON ' +
      'ซึ่งมักเกิดขึ้นขณะเซิร์ฟเวอร์กำลังเริ่มระบบใหม่ (Cold Start) หรือเครือข่ายขัดข้องชั่วคราว ' +
      'กรุณารอสักครู่แล้วกดปุ่ม "ลองใหม่อีกครั้ง"'
    );
  }

  if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
    return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือรันเซิร์ฟเวอร์ใหม่อีกครั้ง';
  }

  return errMsg;
}

/**
 * Performs a fetch request with automatic retries on 502/503/504 or "The page cannot..." proxy errors,
 * safely reading and parsing JSON with full detection of invalid HTML/text responses.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  retries = 2,
  backoffMs = 1200
): Promise<T> {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      // Check if response is an HTML page or starts with "The page..."
      const trimmed = text.trim();
      const isHtml =
        trimmed.startsWith('<!DOCTYPE') ||
        trimmed.startsWith('<html') ||
        trimmed.startsWith('<head') ||
        contentType.includes('text/html');
      const isPageErrorText =
        trimmed.startsWith('The page') ||
        trimmed.startsWith('The service') ||
        trimmed.includes('The page cannot') ||
        trimmed.includes('The page could not');

      if (!response.ok || isHtml || isPageErrorText) {
        // If it's a transient server wake-up error and we have retries left, wait and retry
        if (
          attempt < retries &&
          (response.status === 502 ||
            response.status === 503 ||
            response.status === 504 ||
            response.status === 404 ||
            isPageErrorText ||
            isHtml)
        ) {
          attempt++;
          console.warn(
            `[safeFetchJson] Transient response on ${url} (status: ${response.status}). Retrying attempt ${attempt}/${retries}...`
          );
          await new Promise((r) => setTimeout(r, backoffMs * attempt));
          continue;
        }

        // If retries exhausted or other error
        let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Error'}`;
        if (isPageErrorText || isHtml) {
          errorMsg =
            'เซิร์ฟเวอร์ส่งข้อความสถานะชั่วคราว ("The page could not be loaded") แทนข้อมูล JSON ' +
            'เนื่องจากระบบอยู่ในระหว่างการเริ่มต้นหรือมีการรีเซ็ตการเชื่อมต่อ';
        } else {
          // Attempt to parse json error if available
          try {
            const parsedErr = JSON.parse(text);
            if (parsedErr.error) errorMsg = parsedErr.error;
          } catch {
            if (text && text.length < 200) errorMsg = text;
          }
        }

        throw new ApiError(errorMsg, response.status, isHtml || isPageErrorText, text);
      }

      // Parse JSON safely
      try {
        const data = JSON.parse(text);
        return data as T;
      } catch (parseErr: any) {
        // Handle the exact "Unexpected token 'T', 'The page c'... is not valid JSON" error
        const isUnexpectedT =
          parseErr?.message?.includes("Unexpected token 'T'") ||
          parseErr?.message?.includes('is not valid JSON') ||
          text.includes('The page');

        if (attempt < retries && isUnexpectedT) {
          attempt++;
          console.warn(
            `[safeFetchJson] Caught JSON parse error (${parseErr.message}). Retrying attempt ${attempt}/${retries}...`
          );
          await new Promise((r) => setTimeout(r, backoffMs * attempt));
          continue;
        }

        const friendlyMsg = isUnexpectedT
          ? 'เซิร์ฟเวอร์ส่งข้อมูลหน้าเว็บ ("The page cannot be loaded") แทน JSON ที่ถูกต้อง'
          : `การแปลงข้อมูล JSON ผิดพลาด: ${parseErr?.message}`;

        throw new ApiError(friendlyMsg, response.status, true, text);
      }
    } catch (networkErr: any) {
      if (networkErr instanceof ApiError) {
        throw networkErr;
      }

      // Network level failure
      const isRetryable =
        networkErr?.name === 'TypeError' ||
        networkErr?.message?.includes('fetch') ||
        networkErr?.message?.includes('NetworkError');

      if (attempt < retries && isRetryable) {
        attempt++;
        console.warn(
          `[safeFetchJson] Network error on ${url}. Retrying attempt ${attempt}/${retries}...`
        );
        await new Promise((r) => setTimeout(r, backoffMs * attempt));
        continue;
      }

      const friendlyMsg = formatFriendlyErrorMessage(networkErr);
      throw new ApiError(friendlyMsg, 0, isPageNotJsonError(networkErr), networkErr?.message);
    }
  }

  throw new ApiError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้หลังพยายามหลายครั้ง', 0, false);
}
