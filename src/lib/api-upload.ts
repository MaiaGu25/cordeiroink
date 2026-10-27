/**
 * Helper client-side para upload seguro de arquivos via /api/upload.
 * Valida o content-type da resposta HTTP para nunca estourar o erro de JSON inválido
 * caso um proxy ou middleware retorne uma página HTML de erro.
 */
export async function uploadFileViaApi(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        error:
          response.status === 413
            ? "O arquivo enviado é muito pesado para o servidor (limite de tamanho excedido)."
            : `O servidor retornou uma resposta não-JSON (Status ${response.status}). ${text.slice(0, 80)}`,
      };
    }

    if (response.ok && (data?.url || data?.success)) {
      return { success: true, url: data.url };
    }

    return {
      success: false,
      error: data?.error || `Falha no upload da imagem (Status ${response.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Erro de rede ao enviar arquivo para o servidor.",
    };
  }
}
