/**
 * Django utility functions for handling CSRF tokens and API requests
 */

/**
 * Get CSRF token from Django's CSRF cookie or meta tag
 */
export const getCSRFToken = (): string => {
  // First try to get from cookie
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (cookieValue) {
    return cookieValue;
  }

  // Fallback to meta tag or hidden input
  const csrfElement = document.querySelector(
    "[name=csrfmiddlewaretoken]"
  ) as HTMLInputElement;
  return csrfElement?.value || "";
};

/**
 * Create headers object with CSRF token for Django API requests
 */
export const getDjangoHeaders = (
  additionalHeaders: Record<string, string> = {}
): Record<string, string> => {
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": getCSRFToken(),
    ...additionalHeaders,
  };
};

/**
 * Make a POST request to Django API with proper CSRF handling
 */
export const djangoPost = async (
  url: string,
  data: unknown,
  options: RequestInit = {}
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: getDjangoHeaders(),
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || errorData.detail || response.statusText);
  }

  return response.json();
};

/**
 * Make a GET request to Django API
 */
export const djangoGet = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || errorData.detail || response.statusText);
  }

  return response.json();
};
