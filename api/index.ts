import { Hono, Context } from "hono";
import { handle } from "hono/vercel";
import { sql } from "@vercel/postgres";

export const config = {
  runtime: "edge",
};

const app = new Hono();

app.get("/", async (c: Context) => {
  // console.log("url: ", c.req.url);
  // url: https://usdt.abiui.dev/
  // url: https://0x123456.mainnet.abiui.dev/
  const url = c.req.url;
  const dest = url.slice(url.indexOf("/") + 2, url.indexOf(".abi.dev") - 10);
  // console.log("dest: ", dest);
  // dest: usdt
  // dest: 0x123456.mainnet

  const addrAndNetwork = dest.split(".");
  if (addrAndNetwork.length === 2) {
    const { rows } =
      await sql`SELECT "html" FROM public."contracts" WHERE address=${addrAndNetwork[0]} AND network=${addrAndNetwork[1]}`;

    return rows.length === 0 ? c.notFound() : c.html(rows[0].html);
  } else {
    const { rows } =
      await sql`SELECT "html" FROM public."contracts" WHERE alias=${dest}`;

    return rows.length === 0 ? c.notFound() : c.html(rows[0].html);
  }
});

export default handle(app);
