import { getOdooUrl } from "@/lib/odooApi";

export async function GET() {
  try {
    const baseUrl = getOdooUrl();
    const url = `${baseUrl}/api/companies`;
    console.log('[Companies API] Fetching from:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log('[Companies API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Companies API] Backend error ${response.status}:`, errorText);
      
      return Response.json(
        { 
          error: `Failed to fetch companies: ${response.statusText}`,
          message: `Backend returned ${response.status}`,
          details: errorText || "No error details provided",
          status: response.status,
          debugUrl: url,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log('[Companies API] Success, companies count:', data.data?.length || 0);
    
    return Response.json(data);
  } catch (error) {
    console.error('[Companies API] Error fetching companies:', error);
    
    return Response.json(
      { 
        error: 'Failed to fetch companies from backend',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : "Unknown error",
      },
      { status: 500 },
    );
  }
}
