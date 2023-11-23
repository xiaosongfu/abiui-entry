import { Hono, Context } from "hono";
import { handle } from "hono/vercel";
import { sql } from "@vercel/postgres";

export const config = {
  runtime: "edge",
};

const app = new Hono();

app.get("/", async (c: Context) => {
  // console.log(c.req.url);
  // https://usdt.abiui.xyz/
  // https://0x123456.mainnet.abiui.xyz/
  const url = c.req.url;
  const dest = url.slice(url.indexOf("/") + 2, url.indexOf(".abi.dev") - 10);
  // console.log("dest: ", dest);
  // dest: usdt
  // dest: 0x123456.mainnet

  const contractAndNetwork = dest.split(".");
  if (contractAndNetwork.length === 2) {
    const { rows } =
      await sql`SELECT * FROM public."contracts" WHERE contract=${contractAndNetwork[0]} AND network=${contractAndNetwork[1]}`;
    if (rows.length === 0) {
      return c.notFound();
    }

    return c.html(rows[0].html);
  } else {
    const { rows } =
      await sql`SELECT * FROM public."contracts" WHERE alias=${dest}`;
    if (rows.length === 0) {
      return c.notFound();
    }

    return c.html(rows[0].html);
  }
});

export default handle(app);
