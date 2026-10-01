#VERIFICAÇÃO DE SEGURANÇA DO SAAS

#BANCO DE DADOS

Ferramenta tipo Supabase e Firebase funciona diferente do que você tá acostumado: o banco fala direto com o navegador do cliente, sem servidor no meio filtrando nada. Pra travar isso tem uma parada que se chama RLS (Row Level Security) é a regra onde diz que “esse usuário só vê os dados dele“.

O grande problema é: ela vem desligada.

Pra cada tabela do teu banco, faz o seguinte:

ALTER TABLE public.sua_tabela ENABLE ROW LEVEL SECURITY;
Só isso já fecha a porta pra quem não tá logado.

Depois você configura as policies.

🔴 A chave service_role NUNCA vai pro frontend. Ela pula todo o RLS, é a chave mestra. No navegador só a anon.


#VERIFICAÇÃO GERAL

Revisa este código atrás das 5 falhas mais comuns
em app gerado por IA: (1) tabelas de Supabase/Firebase sem RLS;
(2) autorização decidida no frontend em vez do servidor;
(3) rotas que buscam por ID sem checar o dono (IDOR);
(4) segredos/API keys expostos no código ou no bundle;
(5) input do usuário sem validação/sanitização e upload sem checar tipo de arquivo.
Lista cada achado com arquivo, linha e como corrigir.
