# Doce Encanto 🧁

### Sistema Web de Encomendas e Gerenciamento de Cupcakes

## Sobre o projeto

O **Doce Encanto** é uma aplicação web voltada para a venda e o gerenciamento de encomendas de cupcakes.

O sistema permite que clientes consultem um catálogo de produtos, personalizem cupcakes, realizem pedidos e acompanhem o andamento de suas encomendas.

Além da loja virtual, a aplicação possui um painel administrativo responsável pelo gerenciamento de produtos, pedidos, entregas e comunicação com os clientes.

O projeto utiliza uma arquitetura cliente-servidor, integrando uma interface web, uma API desenvolvida em Node.js e um banco de dados PostgreSQL.

---

## Funcionalidades

O sistema está dividido em duas áreas principais: **Cliente** e **Administrador**.

### Área do Cliente

A interface do cliente reúne as funcionalidades necessárias para realizar e acompanhar encomendas.

**Catálogo de produtos**
- Visualização dos cupcakes disponíveis.
- Pesquisa e filtros de produtos.
- Exibição de imagens, descrições e preços.
- Seções de Mais Pedidos, Novidades, Baratinhos da Semana e Promoções.

**Monte seu Cupcake**

Permite personalizar um cupcake por meio da escolha de três componentes:

- Massa.
- Recheio.
- Cobertura.

Durante a personalização, o sistema apresenta uma representação visual da combinação selecionada e atualiza o preço conforme as escolhas.

A composição é armazenada junto ao pedido, permitindo que a confeitaria consulte os ingredientes selecionados.

**Carrinho e finalização de compras**
- Adição e remoção de produtos.
- Alteração de quantidades.
- Visualização do subtotal.
- Aplicação de cupons promocionais.
- Cadastro do endereço de entrega.
- Confirmação da encomenda.

**Cadastro e autenticação**
- Criação de contas.
- Login e logout.
- Consulta do histórico de pedidos.
- Acesso às informações da conta.

**Pagamento demonstrativo**

O sistema possui uma simulação de pagamento via Pix.

Após a finalização do pedido, são apresentados um QR Code ilustrativo, um código demonstrativo para copiar e o valor da encomenda.

A confirmação simulada atualiza o estado do pagamento e do pedido no banco de dados.

> O pagamento é utilizado exclusivamente para demonstração. O QR Code não realiza transferências bancárias.

**Acompanhamento de pedidos**

O cliente pode consultar as diferentes etapas da encomenda:

1. Pedido feito.
2. Pagamento confirmado.
3. Pedido aceito.
4. Em preparação.
5. Aguardando motoboy.
6. Pedido a caminho.
7. Recebimento confirmado.

A confirmação de recebimento é realizada exclusivamente pelo cliente responsável pelo pedido.

**Mensagens**

O sistema disponibiliza uma área de comunicação entre cliente e confeitaria.

As conversas são vinculadas às encomendas e permitem receber avisos de atraso, informações sobre produtos indisponíveis e propostas de substituição.

O cliente também pode responder às mensagens recebidas.

---

### Área do Administrador

O painel administrativo permite acompanhar e gerenciar as operações da confeitaria.

**Dashboard**
- Visualização dos pedidos registrados.
- Acompanhamento de encomendas pendentes.
- Consulta dos pedidos em preparação.
- Informações gerais dos produtos e das operações.

**Gerenciamento de produtos**
- Cadastro de novos cupcakes.
- Edição de nomes e descrições.
- Alteração de preços.
- Controle de disponibilidade.
- Envio de fotografias diretamente do computador.

**Gerenciamento de pedidos**
- Consulta das encomendas realizadas.
- Visualização dos produtos e quantidades.
- Consulta das combinações de cupcakes personalizados.
- Aceitação de pedidos.
- Atualização das etapas de preparação.
- Registro de cancelamentos e seus motivos.

**Controle de entregas**

O administrador pode atualizar o pedido até a etapa de envio.

Após a entrega, somente o cliente pode confirmar o recebimento, garantindo a separação de responsabilidades entre os perfis.

**Comunicação com clientes**
- Envio de avisos sobre atrasos.
- Comunicação de produtos indisponíveis.
- Propostas de substituição.
- Visualização das respostas.
- Histórico de mensagens por encomenda.

**Avaliações**

O painel possui uma área destinada à consulta das avaliações enviadas pelos usuários.

As informações podem ser utilizadas para identificar dificuldades de navegação e oportunidades de melhoria.

---

## Tecnologias Utilizadas

| Tecnologia | Função |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript | Interatividade do front-end |
| Node.js | Execução do back-end |
| Express.js | Desenvolvimento da API |
| PostgreSQL | Armazenamento dos dados |
| SQL | Consultas e manipulação do banco |
| JSON | Comunicação entre as camadas |
| Multer | Upload de imagens |
| Sharp | Processamento de imagens |
| Git | Controle de versões |
| GitHub | Armazenamento do código |

---

## Funcionamento do Sistema

O Doce Encanto utiliza uma arquitetura cliente-servidor.

O **front-end** é responsável pela interface e pelas interações com os usuários.

O **back-end** recebe as requisições, executa as regras de negócio e realiza a comunicação com o banco de dados.

O **PostgreSQL** armazena as informações de clientes, produtos, pedidos, pagamentos demonstrativos, entregas e mensagens.

O fluxo de comunicação ocorre da seguinte maneira:

```text
Cliente
   |
   v
Interface Web
   |
   v
API REST (Node.js + Express)
   |
   v
Validação e Regras de Negócio
   |
   v
Banco de Dados PostgreSQL
   |
   v
Resposta da API
   |
   v
Atualização da Interface
```

### Fluxo de uma encomenda

1. O cliente acessa o catálogo e seleciona os produtos.
2. Os cupcakes escolhidos são adicionados ao carrinho.
3. O sistema calcula os valores da compra.
4. O cliente informa os dados necessários e finaliza o pedido.
5. O pedido é registrado no PostgreSQL.
6. O pagamento pode ser confirmado por meio da simulação.
7. O administrador recebe a encomenda e inicia a preparação.
8. O status é atualizado conforme o andamento.
9. O cliente acompanha as atualizações.
10. Após receber o produto, o cliente confirma a entrega.

Durante o processo, os dois perfis podem trocar mensagens relacionadas ao pedido.

---

## Banco de Dados

O sistema utiliza o PostgreSQL para armazenar e relacionar as informações necessárias ao funcionamento da aplicação.

Entre as principais entidades estão:

- Clientes.
- Endereços.
- Produtos e categorias.
- Carrinhos.
- Pedidos e itens dos pedidos.
- Cupons promocionais.
- Pagamentos.
- Entregas.
- Histórico de status.
- Mensagens.
- Avaliações.

As tabelas utilizam chaves primárias e estrangeiras para manter o relacionamento entre os registros.

As configurações de cupcakes personalizados são armazenadas utilizando o tipo JSONB.

Exemplo:

```json
{
  "massa": "red",
  "recheio": "avela",
  "cobertura": "framboesa"
}
```

Essa estrutura permite recuperar a composição selecionada durante a compra.

---

## Estrutura do Projeto

```text
Doce_Encanto/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   ├── avaliacao.html
│   └── assets/
│
├── backend/
│   ├── src/
│   ├── sql/
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

A pasta `frontend` contém as interfaces e os recursos visuais.

A pasta `backend` reúne a API, as regras de negócio e a conexão com o banco de dados.

A pasta `sql` contém os scripts utilizados na criação e atualização das tabelas.

A pasta `tests` contém os testes automatizados do sistema.

---

## Como Executar

### Pré-requisitos

Para executar o projeto localmente, são necessários:

- Node.js.
- PostgreSQL.
- Git.

O pgAdmin 4 pode ser utilizado para administrar e consultar o banco de dados.

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/Doce-Encanto.git
```

### 2. Acessar o back-end

```bash
cd Doce-Encanto/backend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar o banco de dados

Crie um banco PostgreSQL chamado:

```text
doce_encanto
```

Crie o arquivo `.env` a partir do `.env.example` e configure as variáveis:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=SUA_SENHA
PGDATABASE=doce_encanto

PORT=3000
NODE_ENV=development
DEMO_MODE=true
```

A senha deve corresponder à configuração local do PostgreSQL.

### 5. Preparar as tabelas

```bash
npm run db:setup
```

### 6. Iniciar o servidor

```bash
npm run dev
```

A aplicação estará disponível nos seguintes endereços:

| Página | Endereço |
|---|---|
| Loja | http://localhost:3000 |
| Administração | http://localhost:3000/admin.html |
| Avaliação | http://localhost:3000/avaliacao.html |

---

## Testes

O projeto possui testes automatizados para verificar as principais regras de negócio.

Entre os recursos testados estão:

- Cálculo de preços.
- Validação de cupons.
- Autenticação.
- Permissões administrativas.
- Registro de pedidos.
- Atualização de status.
- Confirmação de recebimento.
- Comunicação entre os perfis.
- Regras do pagamento demonstrativo.

Para executar os testes:

```bash
npm test
```

A versão organizada do projeto possui **33 testes automatizados aprovados** na última execução registrada.

A validação com usuários externos é realizada separadamente por meio do formulário de avaliação.

---

## Formulário de Avaliação

O Doce Encanto disponibiliza um formulário para coletar opiniões sobre a experiência de utilização.

A avaliação considera aspectos como:

- Aparência do site.
- Facilidade de navegação.
- Organização das informações.
- Clareza das funcionalidades.
- Experiência de compra.
- Pontos positivos.
- Sugestões de melhoria.

As respostas são armazenadas no banco de dados e podem ser consultadas no painel administrativo.

---

## Segurança

O sistema possui mecanismos de autenticação, controle de permissões e validação das informações recebidas.

As operações administrativas exigem autorização específica.

O acesso às mensagens é restrito aos usuários relacionados às encomendas e aos administradores autorizados.

O arquivo `.env`, que contém as configurações privadas do banco de dados, não deve ser publicado no repositório.

O sistema ainda requer ajustes adicionais de segurança antes de uma utilização comercial.

---

## Melhorias Futuras

O projeto poderá receber novas funcionalidades e integrações.

Entre as melhorias previstas estão:

- **Rastreamento por mapa:** acompanhamento da localização do entregador em tempo real.
- **Pagamento real:** integração com serviços de pagamento Pix e cartão.
- **Controle de estoque:** gerenciamento de ingredientes e disponibilidade dos produtos.
- **Notificações:** envio automático de atualizações sobre pedidos.
- **Relatórios:** indicadores de vendas e desempenho dos produtos.
- **Hospedagem em nuvem:** disponibilização da aplicação em um ambiente on-line.
- **Acessibilidade:** melhorias de navegação e compatibilidade com tecnologias assistivas.

---

## Considerações Finais

O Doce Encanto reúne funcionalidades de comércio eletrônico e gerenciamento de encomendas em uma aplicação web integrada.

O sistema permite demonstrar a comunicação entre front-end, API e banco de dados, incluindo autenticação, processamento de pedidos, controle de permissões, comunicação entre usuários e acompanhamento de entregas.

A aplicação está estruturada para permitir a continuidade do desenvolvimento e a implementação de novas funcionalidades.