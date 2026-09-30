const POLLUTANT_PLACEHOLDER = '%%pol%%';

const TILE_BASE: string = `https://ukair.maps.rcdo.co.uk/ukairserver/services/aq_amb_2021/${POLLUTANT_PLACEHOLDER}/MapServer/WMSServer`;

// Handle get request
export const GET: RequestHandler = async ({ url, fetch }) => {
  // Get and append search params
  const params = url.searchParams;

  // Get the pollutant the user has selected, then delete it from the list.
  const pollutant = params.get('pollutant');
  params.delete('pollutant');

  // Add the pollutant to the base url
  const baseUrl = TILE_BASE.replace(POLLUTANT_PLACEHOLDER, pollutant);

  // Combine the base URL and the params
  const combinedUrl = `${baseUrl}?${params}`;

  // Forward the reqeust
  const res = await fetch(combinedUrl);
  // console.log(res)

  // Return the response
  return new Response(res.body, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
