import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getSiteContentTool from "./tools/get-site-content";
import listLooksTool from "./tools/list-looks";
import updateLookTool from "./tools/update-look";
import updateSiteTextTool from "./tools/update-site-text";
import visitStatsTool from "./tools/visit-stats";

// O emissor OAuth precisa ser o host direto do Supabase; o ref do projeto é
// inlinado pelo Vite no build e sobrevive à publicação.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "maria-maria-lookbook",
  title: "Maria & Maria Lookbook",
  version: "0.1.0",
  instructions:
    "Ferramentas do lookbook Maria e Maria: consultar e ajustar looks, ler e editar os textos do site e acompanhar os acessos. Alterações exigem uma conta de administrador do painel.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  // O SDK tipa `outputSchema` como opcional exato; nossas ferramentas não o usam.
  tools: [listLooksTool, updateLookTool, getSiteContentTool, updateSiteTextTool, visitStatsTool] as Parameters<
    typeof defineMcp
  >[0]["tools"],
});
