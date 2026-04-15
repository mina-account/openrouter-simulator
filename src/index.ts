import "dotenv/config";
import { createApp } from "./server";
import { loadCsv } from "./csv";

const PORT = parseInt(process.env.PORT ?? "5200", 10);

loadCsv();

const app = createApp();
app.listen(PORT, () => {
  console.log(`OpenRouter Simulator running on http://localhost:${PORT}`);
});
