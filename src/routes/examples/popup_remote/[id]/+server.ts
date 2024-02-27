import { json } from '@sveltejs/kit';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * This is a very contrived example.
 */
export async function GET({ params }) {
  const { id } = params;
  // make this request take one second
  await sleep(1000);
  // return some meaningless data
  return json({
    id,
    width: 10 * id.length,
    height: 12 * id.length,
  });
}
