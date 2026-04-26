import { getApiDocs } from "../../lib/swagger";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default async function ApiDocPage() {
  const spec = await getApiDocs();

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}
