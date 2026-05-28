const BASE_URL = "https://api.abacatepay.com/v2";

function getApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY?.trim();

  if (!key) {
    throw new Error("ABACATEPAY_API_KEY is not configured.");
  }

  return key;
}

export async function abacatePost<T>(
  path: string,
  body: unknown,
): Promise<{ data: T } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await response.json().catch(() => null)) as {
      data?: T;
      error?: string | null;
    } | null;

    if (!response.ok || !json || json.error || !json.data) {
      return {
        error: json?.error ?? `AbacatePay API ${response.status}`,
      };
    }

    return { data: json.data };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Erro de rede ao chamar a AbacatePay.",
    };
  }
}
