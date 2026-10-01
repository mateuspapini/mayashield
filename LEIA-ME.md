# Site MayaShield — como publicar e o que trocar

Site estático (HTML + CSS + JS puro), sem build. Para publicar no GitHub Pages,
suba **o conteúdo** desta pasta na raiz do repositório: `index.html`, `LEIA-ME.md`
(opcional) e a pasta `assets`.

## Estrutura
| Caminho | O que é |
|---|---|
| `index.html` | Página única em espanhol (hero, problema, serviços, sistemas, processo, antes/depois, projetos, garantia, depoimentos, FAQ, contato) |
| `assets/css/style.css` | Estilos, paleta da marca e responsivo |
| `assets/js/main.js` | Menu, medidor de profundidade, tabs, processo, comparador, carrossel, FAQ, formulário |
| `assets/fonts/` | Manrope e Inter (variáveis, locais — não dependem do Google Fonts) |
| `privacidad.html`, `terminos.html` | Aviso de privacidade e termos de uso (linkados no rodapé) |
| `assets/img/` | Logo (principal e branca), símbolo, favicons, imagem OG e logo da MAPA (crédito no rodapé) |

## Placeholders para trocar
- E-mail `contacto@mayashield.mx` → `index.html` e `assets/js/main.js` (destino do formulário via `mailto:`).
- Números do hero (`data-count` em `index.html`): 140 projetos, 38.000 m², 10 anos.
- Projetos, depoimentos e FAQ são textos ilustrativos.
- Fotografias ficam em `assets/img/fotos/` (webp, 1200px).
- Quando houver domínio final, ajuste `og:image` para a URL absoluta (ex.: `https://mayashield.mx/assets/img/og-mayashield.jpg`).

## Formulário
Sem backend: ao enviar, abre o cliente de e-mail com a solicitação preenchida.
Para receber direto na caixa de entrada sem depender do cliente de e-mail, troque por
Formspree, Netlify Forms ou um endpoint próprio (o `submit` está em `assets/js/main.js`).
