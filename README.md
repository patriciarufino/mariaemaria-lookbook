# Maria & Maria Lookbook

Quero implementar/reconstruir este projeto tomando como referência visual e estrutural a página:

https://mariaemaria.lovable.app/

IMPORTANTE: não quero uma página apenas inspirada na referência. Quero reproduzir a estrutura, organização, hierarquia visual, experiência, textos, seções, funcionalidades, proporções, espaçamentos e comportamento da página de referência com a maior fidelidade possível.

A página pública deve continuar sendo um LOOKBOOK DIGITAL PREMIUM, e o projeto também deve possuir um PAINEL ADMINISTRATIVO REAL, protegido e funcional, para que eu consiga administrar todo o conteúdo sem precisar editar código.

NÃO crie e-commerce.
NÃO crie carrinho.
NÃO crie checkout.
NÃO crie preços.
NÃO crie login para clientes.
NÃO crie cadastro de clientes.
NÃO crie feed do Instagram.
NÃO crie página “Sobre nós”.
NÃO adicione categorias que não existem na referência.

==================================================

1. PÁGINA PÚBLICA
   ==================================================

Reproduzir a estrutura da página de referência, mantendo:

* cabeçalho/hero;
* identidade visual Maria e Maria;
* frase principal;
* apresentação;
* seção de coleção;
* cards dos looks;
* fotografias;
* referências;
* botão “Quero este look”;
* seção de lookbook completo;
* navegação por setas;
* navegação por teclado;
* swipe no celular;
* seção final;
* rodapé.

Manter os textos da referência, incluindo:

“Lookbook — Edição 2026”

“A moda passa, o estilo permanece — e cada cliente merece uma peça que conte a sua história.”

“Uma coleção autoral onde moda e cliente se encontram — vestidos, conjuntos e macacões escolhidos peça a peça.”

“Lookbook — Curadoria 2026”

“Vestir uma ocasião, como quem escreve uma memória.”

“Peças únicas, cuidadosamente selecionadas para mulheres que valorizam elegância, exclusividade e sofisticação em cada detalhe.”

“Ver coleção atual”

“Lookbook”

“Coleção Atual”

“Bem-vindo ao nosso Lookbook! Aqui você acompanha as principais novidades da loja, com novos looks, tendências e peças selecionadas especialmente para você. Esta página é atualizada frequentemente, por isso salve este link e volte sempre para conferir os últimos lançamentos.”

Manter:

REF 001
REF 002
REF 003
REF 004
REF 005
REF 006

Manter o botão:

“Quero este look”

Manter a seção:

“Lookbook completo”

Título:

“Toda a coleção, em uma só tela.”

Texto:

“Abra o lookbook unificado e percorra as peças da coleção com setas, teclado ou swipe.”

Botão:

“Ver lookbook completo”

Manter a seção:

“Sempre novo”

Título:

“Novidades a cada estação.”

Texto:

“Nosso Lookbook é atualizado constantemente com novos produtos, tendências e inspirações. Acompanhe as novidades e volte sempre para descobrir as próximas coleções.”

Manter:

“MARIA e MARIA”

“Obrigado pela sua visita! Esperamos você novamente em breve para conferir as próximas novidades da nossa coleção.”

“© 2026 Maria e Maria — Lookbook. Todos os direitos reservados.”

ATENÇÃO:

Cada LOOK deve possuir EXATAMENTE DOIS CAMPOS DE IMAGEM DIFERENTES.

Não tratar como duas fotos genéricas.

Cada look terá:

1. FOTO DO LOOK COMPLETO
2. FOTO DE DETALHE DO LOOK

Esses dois campos devem ser separados desde o banco de dados até o painel administrativo e a página pública.

A estrutura é:

REF 001
→ Foto do look completo
→ Foto de detalhe

REF 002
→ Foto do look completo
→ Foto de detalhe

REF 003
→ Foto do look completo
→ Foto de detalhe

REF 004
→ Foto do look completo
→ Foto de detalhe

REF 005
→ Foto do look completo
→ Foto de detalhe

REF 006
→ Foto do look completo
→ Foto de detalhe

Total inicial: 12 imagens.

A primeira imagem deve ser a fotografia principal do look, mostrando o look de maneira completa.

No painel administrativo, chamar:

“Foto do look completo”

ou

“Foto principal — Look completo”

Essa será a imagem principal do card.

A segunda imagem deve ser obrigatoriamente uma fotografia de detalhe da peça.

Ela pode mostrar:

* tecido;
* textura;
* renda;
* bordado;
* acabamento;
* aplicação;
* modelagem;
* manga;
* gola;
* decote;
* botões;
* outro detalhe da peça.

No painel administrativo, chamar:

“Foto de detalhe”

ou

“Foto de detalhe do look”

IMPORTANTE:

Não utilizar a mesma imagem automaticamente nos dois campos.

Os nomes:

“Foto do look completo”
“Foto principal”
“Foto de detalhe”
“Foto de detalhe do look”

devem aparecer SOMENTE dentro do painel administrativo.

Na página pública, não escrever “corpo inteiro”, “look completo”, “detalhe”, “imagem 1” ou “imagem 2” sobre as fotografias.

A cliente deve visualizar somente a composição editorial das duas imagens.

Criar uma área administrativa protegida em:

/admin

O painel não deve aparecer para visitantes comuns.

Não criar uma simulação visual de painel.

Quero um painel REAL, conectado ao banco de dados e capaz de alterar de verdade a página pública.

O administrador deve conseguir controlar praticamente todo o conteúdo editável da página.

Criar menu:

DASHBOARD
LOOKS
FOTOS
GALERIAS
TEXTOS
SEÇÕES
WHATSAPP
ADMINISTRADORES
CONFIGURAÇÕES

Criar automaticamente durante a configuração inicial o primeiro administrador.

E-mail:

patir[mkt@gmail.com](mailto:mkt@gmail.com)

Senha inicial:

4322pati

Função:

ADMINISTRADOR PRINCIPAL

Esse administrador deve sair da implementação já cadastrado e autorizado.

NÃO quero:

* tela para criar o primeiro administrador;
* cadastro manual do primeiro admin;
* SQL manual para eu executar;
* configuração manual de permissões;
* etapas extras para criar o primeiro usuário.

Quero conseguir acessar diretamente:

/admin

utilizando o e-mail e senha acima.

Após o primeiro login, permitir que eu altere a senha.

Permitir no máximo 3 administradores.

ADMIN 1:
Administrador principal — já criado.

ADMIN 2:
Pode ser cadastrado posteriormente.

ADMIN 3:
Pode ser cadastrado posteriormente.

Não permitir um quarto administrador.

Esse limite deve ser validado no backend, não apenas no frontend.

Mostrar no painel:

“Administradores: 1/3”

ou:

“Administradores: 2/3”

ou:

“Administradores: 3/3”

Quando chegar em 3/3, bloquear a criação de novos administradores.

O administrador principal poderá:

* visualizar administradores;
* adicionar administrador;
* editar administrador;
* alterar nome;
* alterar e-mail;
* alterar permissões;
* ativar/desativar;
* remover;
* redefinir acesso;
* alterar senha;
* visualizar último acesso.

Exigir confirmação antes de excluir.

Nunca permitir excluir acidentalmente o único administrador principal.

Criar uma área:

LOOKS

Permitir:

* criar look;
* editar;
* excluir;
* duplicar;
* alterar REF;
* alterar ordem;
* publicar;
* despublicar;
* deixar como rascunho;
* ocultar;
* reativar.

Cada look deverá possuir obrigatoriamente estes dois campos separados:

FOTO DO LOOK COMPLETO
[UPLOAD]

FOTO DE DETALHE
[UPLOAD]

Não criar apenas um campo genérico chamado “Fotos”.

Na edição de cada look, apresentar visualmente:

REF 001

FOTO DO LOOK COMPLETO
[prévia da imagem]
[Substituir] [Excluir]

FOTO DE DETALHE
[prévia da imagem]
[Substituir] [Excluir]

Permitir:

* upload;
* visualização;
* substituição;
* exclusão;
* confirmação;
* salvar.

Se eu substituir a foto do look completo, somente ela deverá ser alterada.

Se eu substituir a foto de detalhe, somente ela deverá ser alterada.

Nunca substituir as duas automaticamente.

Para publicar um look, exigir obrigatoriamente:

✓ Foto do look completo
✓ Foto de detalhe

Se faltar alguma delas, informar:

“Este look precisa de duas imagens: uma foto do look completo e uma foto de detalhe.”

Pode permitir salvar como rascunho sem as duas imagens.

Mas NÃO permitir publicação sem as duas.

Não limitar o sistema aos 6 looks atuais.

Eu preciso conseguir criar futuramente:

REF 007
REF 008
REF 009
REF 010
etc.

Sem alterar código.

Ao clicar em “Adicionar novo look”, apresentar:

REF
Foto do look completo
Foto de detalhe
Status
Ordem
Salvar

Criar área:

FOTOS

Permitir:

* adicionar;
* excluir;
* substituir;
* visualizar;
* associar a um look;
* mover;
* ordenar;
* ativar/desativar.

Antes de excluir, pedir confirmação.

As imagens devem permanecer associadas corretamente ao respectivo look e ao respectivo tipo:

full_look_image
detail_image

ou estrutura equivalente.

Criar área:

GALERIAS

Permitir:

* criar;
* editar;
* excluir;
* duplicar;
* adicionar fotos;
* excluir fotos;
* reordenar;
* alterar nome;
* alterar descrição;
* publicar;
* despublicar.

Permitir criar novas galerias futuramente sem alterar o código.

Criar área:

TEXTOS

Permitir editar sem código:

* título principal;
* subtítulos;
* descrições;
* textos dos cards;
* REF;
* textos dos botões;
* textos do lookbook;
* textos finais;
* rodapé;
* mensagens do WhatsApp.

Toda alteração publicada deverá refletir na página pública.

Criar área:

SEÇÕES

Permitir:

* editar;
* ativar;
* desativar;
* ocultar;
* reativar;
* reorganizar quando aplicável.

Controlar:

* Hero;
* Coleção Atual;
* Lookbook;
* Sempre Novo;
* Rodapé.

Desativar uma seção não pode quebrar a página.

Criar área:

WHATSAPP

Permitir editar:

* número;
* mensagem padrão;
* mensagem individual de cada REF;
* texto do botão.

Cada REF deve possuir mensagem individual.

Exemplo:

REF 001:

“Olá! Gostaria de saber mais informações sobre o look REF 001.”

O número do WhatsApp deve ser totalmente editável pelo painel.

Permitir alterar a ordem:

* dos looks;
* das fotografias;
* das galerias;
* das seções quando aplicável.

A ordem configurada no painel deve ser a ordem exibida para o visitante.

Sempre que possível, permitir:

* salvar rascunho;
* visualizar;
* publicar;
* despublicar.

Criar botão:

“Visualizar página”

E:

“Voltar ao painel”

Criar dashboard com:

* total de looks;
* total de fotografias;
* total de galerias;
* total de administradores;
* publicados;
* rascunhos;
* últimos conteúdos alterados;
* último acesso administrativo.

Mostrar:

“Administradores: X/3”

Registrar:

* administrador;
* data do último login;
* horário do último login;
* status ativo/inativo.

Essas informações são exclusivas do painel.

Não exibir para clientes.

NÃO criar autenticação falsa no frontend.

NÃO usar apenas localStorage para determinar quem é administrador.

A autenticação precisa ser real e protegida no backend.

Se utilizar Supabase, configurar corretamente:

* autenticação;
* perfis administrativos;
* permissões;
* Row Level Security;
* políticas de acesso;
* proteção de rotas;
* proteção de CRUD.

MUITO IMPORTANTE:

Já ocorreu anteriormente um erro:

“permission denied for function is_admin”

Não repetir esse problema.

Revisar completamente a arquitetura de autenticação e permissões.

Se utilizar a função is_admin, garantir que ela tenha todas as permissões necessárias para funcionar corretamente.

Evitar dependência circular entre:

RLS → is_admin → tabela de usuários → RLS → is_admin

Testar efetivamente o acesso do administrador.

O administrador principal precisa conseguir:

1. fazer login;
2. entrar em /admin;
3. visualizar dashboard;
4. criar look;
5. editar look;
6. excluir look;
7. enviar foto;
8. excluir foto;
9. substituir foto;
10. criar galeria;
11. editar galeria;
12. excluir galeria;
13. editar textos;
14. alterar seções;
15. alterar WhatsApp;
16. publicar;
17. despublicar;
18. cadastrar segundo administrador;
19. cadastrar terceiro administrador.

Não considerar concluído se alguma dessas operações resultar em erro de permissão.

Todas as operações administrativas precisam ser protegidas no backend.

Um visitante comum não pode:

* criar fotos;
* excluir fotos;
* editar textos;
* criar looks;
* editar galerias;
* alterar configurações;
* criar administradores;
* acessar dados administrativos.

Mesmo acessando diretamente uma rota ou API, a operação deve ser bloqueada.

O limite de 3 administradores também deve ser validado no backend.

Não confiar apenas no frontend.

Não permitir que uma chamada direta ao banco/API crie um quarto administrador.

O administrador deve conseguir futuramente:

* trocar fotos;
* adicionar fotos;
* excluir fotos;
* criar looks;
* editar looks;
* criar galerias;
* excluir galerias;
* editar textos;
* alterar títulos;
* alterar descrições;
* alterar botões;
* alterar WhatsApp;
* reorganizar conteúdo;
* publicar;
* despublicar.

Tudo pelo painel.

O painel administrativo deve ser separado da experiência da cliente.

Página pública:

https://mariaemaria.lovable.app/

Painel:

/admin

Não mostrar o painel no menu público.

O painel pode ter design próprio, priorizando facilidade de uso.

Criar interface administrativa organizada e profissional.

Menu:

DASHBOARD
LOOKS
FOTOS
GALERIAS
TEXTOS
SEÇÕES
WHATSAPP
ADMINISTRADORES
CONFIGURAÇÕES

O painel deve ser fácil de usar mesmo para quem não entende programação.

Vou enviar novamente as fotografias.

Eu vou organizar as imagens em pares:

REF 001
→ foto do look completo
→ foto de detalhe

REF 002
→ foto do look completo
→ foto de detalhe

REF 003
→ foto do look completo
→ foto de detalhe

etc.

Quando eu enviar as fotos:

* não gerar imagens;
* não substituir por imagens genéricas;
* não utilizar banco de imagens;
* não aplicar filtros;
* não alterar cores;
* não alterar roupas;
* não alterar pessoas;
* não alterar composição;
* não aplicar efeitos de IA.

Se houver dúvida sobre qual imagem é qual, NÃO escolher automaticamente.

Permitir que eu selecione manualmente:

“Usar como foto do look completo”

ou

“Usar como foto de detalhe”.

Não armazenar as duas imagens em um único campo genérico.

Cada look precisa possuir campos separados, equivalentes a:

reference
full_look_image
detail_image
status
display_order

As duas imagens precisam permanecer vinculadas ao mesmo look.

A página pública precisa funcionar perfeitamente em:

* desktop;
* notebook;
* tablet;
* celular.

No celular:

* manter proporção;
* não cortar inadequadamente;
* não deformar imagens;
* manter os dois tipos de fotografia;
* permitir swipe;
* manter botões acessíveis;
* evitar sobreposição;
* evitar rolagem horizontal.

Reproduzir o mais fielmente possível:

* cores;
* tipografia;
* proporções;
* espaçamentos;
* alinhamentos;
* tamanho dos títulos;
* tamanho das imagens;
* posição dos botões;
* composição;
* transições;
* navegação;
* desktop;
* mobile.

Não fazer uma interpretação criativa.

Não modernizar sem autorização.

Não adicionar elementos que não existam na referência.

Antes de finalizar, testar:

1. Login do administrador principal.
2. Acesso /admin.
3. Dashboard.
4. Upload de foto do look completo.
5. Upload de foto de detalhe.
6. Substituição da foto do look completo sem alterar o detalhe.
7. Substituição da foto de detalhe sem alterar o look completo.
8. Exclusão de foto.
9. Criação de novo look.
10. Edição de look.
11. Exclusão de look.
12. Criação de galeria.
13. Edição de galeria.
14. Exclusão de galeria.
15. Edição de textos.
16. Edição de botões.
17. Edição do WhatsApp.
18. Publicação.
19. Despublicação.
20. Cadastro do segundo administrador.
21. Cadastro do terceiro administrador.
22. Bloqueio do quarto administrador.
23. Login dos administradores adicionais.
24. Bloqueio de visitante comum.
25. Proteção das operações no backend.
26. RLS.
27. is_admin, se utilizado.
28. Página pública.
29. Lookbook completo.
30. WhatsApp.
31. Desktop.
32. Mobile.

Se houver qualquer erro de autenticação, banco, RLS, permissão ou função is_admin, CORRIGIR antes de finalizar.



PÁGINA PÚBLICA PREMIUM
+
LOOKBOOK
+
6 LOOKS INICIAIS
+
2 IMAGENS DISTINTAS POR LOOK
+
FOTO DO LOOK COMPLETO
+
FOTO DE DETALHE
+
PAINEL ADMINISTRATIVO REAL
+
AUTENTICAÇÃO REAL
+
ADMINISTRADOR PRINCIPAL PRÉ-CADASTRADO
+
LIMITE DE 3 ADMINISTRADORES
+
GERENCIAMENTO DE FOTOS
+
GERENCIAMENTO DE LOOKS
+
GERENCIAMENTO DE GALERIAS
+
GERENCIAMENTO DE TEXTOS
+
GERENCIAMENTO DE SEÇÕES
+
GERENCIAMENTO DE WHATSAPP
+
PUBLICAÇÃO/DESPUBLICAÇÃO
+
PROTEÇÃO DE BACKEND
+
RLS CONFIGURADO CORRETAMENTE
+
SEM ERRO “permission denied for function is_admin”.

NÃO me peça para criar o primeiro administrador manualmente.

NÃO me peça para executar SQL manualmente.

NÃO me peça para configurar permissões manualmente.

Faça a implementação completa no próprio projeto.

Depois de concluir a estrutura, aguarde as fotografias que vou enviar para inserir nos campos corretos.

REGRA MAIS IMPORTANTE DAS FOTOS:

CADA LOOK = EXATAMENTE 2 IMAGENS DISTINTAS:

1ª = FOTO DO LOOK COMPLETO
2ª = FOTO DE DETALHE DO LOOK

Essa estrutura deve ser respeitada no banco de dados, painel administrativo, página pública e Lookbook completo.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mariaemaria-lookbook.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/354a4d5a-2423-475f-ac4e-1254a1573441).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
