export function PrivacyBodyPt() {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;nós&rdquo;, &ldquo;nos&rdquo; ou &ldquo;nosso&rdquo;) é um serviço operado
        pela <strong>Lavi Learning and Training Technologies LLC</strong>, uma empresa registrada nos Estados Unidos.
        Esta Política de Privacidade explica quais informações coletamos, como as utilizamos e quais escolhas você tem.
      </p>
      <p>
        Se você tiver alguma dúvida, entre em contato pelo e-mail{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Informações que coletamos</h2>
      <h3>Informações da conta</h3>
      <p>
        Quando você cria uma conta, coletamos seu endereço de e-mail e, se você fizer login com o Google, as
        informações básicas de perfil fornecidas pelo Google (nome de exibição, foto de perfil). Não recebemos sua
        senha do Google.
      </p>
      <p>
        {"No aplicativo para iOS, você também pode entrar com Apple. Nesse caso, a Apple nos fornece o nome e o endereço de e-mail que você escolher compartilhar, que pode ser um endereço relay privado que encaminha nossos e-mails para você. Não recebemos sua senha da Apple."}
      </p>
      <h3>Informações de uso</h3>
      <p>
        Quando você usa o Gadit, processamos:
      </p>
      <ul>
        <li>as palavras e frases opcionais que você consulta;</li>
        <li>imagens geradas a seu pedido;</li>
        <li>seu plano de assinatura e situação de pagamento;</li>
        <li>um histórico recente de pesquisas (para usuários pagos, até as 10 últimas palavras), armazenado para que você possa acessá-lo novamente depois;</li>
        <li>
          {"se você usar o assistente do Gadit na central de ajuda: as perguntas que você faz, as respostas dele e se você marcou uma resposta como útil, juntamente com o ID da sua conta (e o ID da família, se houver), endereço de e-mail, plano, idioma da interface e se você usou o site ou o aplicativo;"}
        </li>
        <li>cotas mensais (por exemplo, o número de imagens que você gerou neste ciclo de cobrança).</li>
      </ul>
      <p>
        {"O assistente do Gadit não é oferecido em perfis infantis, no Modo Infantil nem a visitantes que não tenham iniciado sessão. Por favor, não digite senhas nem números de cartão nele."}
      </p>
      <h3>Dados técnicos e de análise</h3>
      <p>
        Coletamos automaticamente informações técnicas básicas, como endereço IP, tipo de navegador, tipo de
        dispositivo, URL de origem e páginas visualizadas. Isso é usado para segurança, monitoramento de desempenho
        e análises agregadas. As análises são fornecidas pela Vercel e são anonimizadas no ponto de coleta (nenhum
        identificador pessoal é armazenado). Nas nossas páginas de marketing, cadastro e pagamento, também usamos
        ferramentas de publicidade e análise, descritas na Seção 3.
      </p>
      <h3>Informações de pagamento</h3>
      <p>
        Se você assinar um plano, o pagamento é processado pela <strong>Stripe, Inc.</strong> Não vemos nem
        armazenamos o número completo do seu cartão; recebemos apenas um token de cliente e os metadados necessários
        para identificar a assinatura.
      </p>

      <h2>2. Como usamos suas informações</h2>
      <ul>
        <li>para fornecer e melhorar o serviço Gadit (gerando definições, imagens, feedback de frases, quizzes);</li>
        <li>para manter sua conta e personalizar sua experiência (histórico de pesquisa, idioma preferido, Modo Infantil);</li>
        <li>para processar assinaturas e enviar e-mails transacionais (recibos, alterações de assinatura);</li>
        <li>
          {"para responder às suas perguntas no assistente do Gadit e melhorar nossas respostas de ajuda e, quando o assistente encaminhar uma pergunta à nossa equipe, para enviar por e-mail à equipe a conversa recente com seu nome, endereço de e-mail, plano, idioma da interface e se você usou o site ou o aplicativo, para que a equipe possa responder a você por e-mail;"}
        </li>
        <li>para medir e melhorar o desempenho do produto e prevenir abusos;</li>
        <li>para cumprir obrigações legais.</li>
      </ul>
      <p>
        Nós <strong>não vendemos</strong> suas informações pessoais e não usamos seu conteúdo para exibir anúncios a você.
      </p>

      <h2>3. Serviços de terceiros que utilizamos</h2>
      <p>
        O Gadit depende dos seguintes processadores. Cada um recebe apenas as informações mínimas necessárias para
        fornecer o serviço correspondente:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>{": processa as palavras e frases que você envia para gerar definições, feedback de frases e quizzes, transforma texto em fala, transcreve entrada de voz, lê o texto em fotos e arquivos PDF que você envia, por exemplo páginas de lição de casa, e gera imagens. Também redige as respostas do assistente do Gadit: enviamos à OpenAI sua pergunta, as mensagens anteriores da mesma conversa, o idioma da sua interface, seu plano e se você está no site ou no aplicativo, e não anexamos seu nome nem seu endereço de e-mail. Os dados enviados à OpenAI são regidos pela política de uso de dados da API da OpenAI."}
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): armazena sua conta,
          perfil, status de assinatura, histórico de pesquisa e imagens geradas.
        </li>
        <li>
          <strong>Google</strong>{":  (Gemini, via Google Cloud), transforma texto em fala. Enviamos a ele apenas o texto que deve ser lido em voz alta, como palavras, frases e histórias, e o áudio é mantido no nosso armazenamento do Firebase para que possa ser reproduzido novamente. Em um jogo de leitura, ele também ouve o som que uma criança diz em voz alta, para verificá-lo, e essa gravação não é armazenada. Google Fonts fornece as fontes da interface em chinês, japonês e coreano e vê seu endereço IP."}
        </li>
        <li>
          <strong>Dicta</strong>{": uma organização sem fins lucrativos israelense, adiciona sinais vocálicos ao texto em hebraico para leitores jovens. Enviamos a ela apenas o texto em hebraico."}
        </li>
        <li>
          <strong>Stripe</strong>: processa pagamentos, assinaturas e portal de cobrança.
        </li>
        <li>
          <strong>Apple</strong>{": fornece o Iniciar sessão com Apple no aplicativo para iOS, veja a seção 1, e vende e cobra as assinaturas compradas no aplicativo para iOS. Nessas compras, a Apple processa o pagamento, e recebemos apenas uma confirmação da compra e do seu status, como uma renovação ou um reembolso."}
        </li>
        <li>
          <strong>PayPal</strong>{": paga nossos parceiros. Fornecemos a ele o endereço de e-mail PayPal do parceiro e o valor."}
        </li>
        <li>
          <strong>Resend</strong>{": envia nossos e-mails (como links de entrada e notificações) e entrega à nossa equipe as perguntas que o assistente do Gadit encaminha, com seu endereço de e-mail como endereço de resposta."}
        </li>
        <li>
          <strong>Expo</strong>{": entrega as notificações do aplicativo para iOS, como os alertas que um responsável pode ativar, que incluem o nome de uma criança e a palavra que a criança pesquisou."}
        </li>
        <li>
          <strong>Vercel</strong>: hospeda e entrega o site, e fornece análises anonimizadas e medição de desempenho.
        </li>
        <li>
          <strong>Yooniz</strong>{": um serviço separado de aprendizagem em família do mesmo fundador. O Yooniz pode nos perguntar se o endereço de e-mail de um responsável tem um plano Family ativo no Gadit, e respondemos apenas sim ou não. Se tiver, a família pode abrir o Gadit a partir do Yooniz sem senha: o Yooniz nos envia o endereço de e-mail do responsável, os nomes de exibição dos membros da família e se cada um deles é um responsável, um menino ou uma menina. Quando uma criança que abriu o Gadit a partir do Yooniz entende uma palavra, enviamos ao Yooniz o endereço de e-mail do responsável, o ID da criança no Yooniz e o número de pontos de aprendizagem obtidos, nunca a própria palavra."}
        </li>
        <li>
          <strong>flagcdn.com</strong>{": fornece as pequenas imagens de bandeiras exibidas nas nossas páginas e, por isso, vê seu endereço IP e dados do seu navegador."}
        </li>
        <li>
          <strong>Publicidade e análise</strong>{": Meta (Meta Pixel), Google Analytics e TikTok (TikTok Pixel e Events API) medem as visitas e os resultados dos nossos anúncios. Eles usam cookies e tecnologias semelhantes nas nossas páginas de marketing, cadastro e pagamento. Quando você se cadastra ou paga, podemos enviar a esses serviços um endereço de e-mail e um ID de conta com hash, criptografados de forma irreversível, junto com seu endereço IP e dados do seu navegador, apenas para medir nossos anúncios. Affonso, um serviço de links de afiliados, é carregado nas mesmas páginas e em qualquer página que um visitante acesse por meio de um link de parceiro, e mantém um cookie por até 60 dias. Se você se cadastrar depois de chegar por meio de um link de afiliado da Affonso, enviaremos à Affonso seu endereço de e-mail, nome e ID de conta, para que o afiliado que indicou você receba o crédito. Nunca enviamos a nenhum desses serviços informações sobre crianças, e essas ferramentas não funcionam em um perfil de criança, no Modo Crianças nem nas páginas de link de turma."}
        </li>
      </ul>

      <h2>4. Por quanto tempo mantemos suas informações</h2>
      <ul>
        <li>Informações da conta: enquanto sua conta existir.</li>
        <li>Histórico de pesquisa: as últimas 10 pesquisas por usuário, atualizadas a cada nova pesquisa.</li>
        <li>
          {"Conversas com o assistente do Gadit: 180 dias e, em seguida, excluídas automaticamente, ou antes disso se você excluir sua conta. Uma contagem diária das suas perguntas, usada para o limite diário, é excluída após 3 dias."}
        </li>
        <li>
          {"Perguntas que o assistente do Gadit encaminha à nossa equipe: mantidas na caixa de e-mail da nossa equipe, como qualquer e-mail que você nos envie."}
        </li>
        <li>Imagens geradas: mantidas para que a mesma palavra+significado possa reutilizar a imagem em cache. Podem ser retidas por tempo indeterminado enquanto sua conta estiver ativa.</li>
        <li>Registros de cobrança e fiscais: conforme exigido pela legislação aplicável (tipicamente 7 anos).</li>
        <li>
          {"Contas excluídas: um breve registro de que a conta foi excluída (seu endereço de e-mail, plano e o motivo e a observação que você forneceu, se houver), mantido para que possamos responder a perguntas sobre a exclusão."}
        </li>
        <li>Dados de análise: agregados, normalmente retidos pelo provedor de análise por 13 meses.</li>
      </ul>

      <h2>5. Seus direitos</h2>
      <p>Dependendo do local onde você mora, você pode ter o direito de:</p>
      <ul>
        <li>solicitar acesso às informações pessoais que mantemos sobre você;</li>
        <li>solicitar a correção de informações incorretas;</li>
        <li>solicitar a exclusão da sua conta e dos dados associados;</li>
        <li>exportar seus dados em um formato portátil;</li>
        <li>opor-se ou restringir determinados usos das suas informações;</li>
        <li>optar por não participar de determinados compartilhamentos de dados (quando aplicável nos termos da CCPA ou leis similares).</li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos, envie um e-mail para{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Responderemos em até 30 dias.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Utilizamos salvaguardas padrão do setor: conexões criptografadas (HTTPS), APIs autenticadas e
        controles de acesso, para proteger suas informações. Nenhum método de transmissão ou armazenamento na
        internet é 100% seguro, portanto não podemos garantir segurança absoluta, mas trabalhamos continuamente
        para reduzir riscos.
      </p>

      <h2>7. Crianças</h2>
      <p>
        {"Uma conta do Gadit é destinada a adultos, com 18 anos ou mais. Crianças e adolescentes usam o Gadit apenas por meio de um adulto, de uma de duas formas."}
      </p>
      <p>
        {"Perfis Family: um dos pais adiciona cada criança como um perfil dentro da conta Family do pai, mãe ou responsável, com um nome e a informação de se a criança é menino ou menina e, se o pai, mãe ou responsável os adicionar, também idade, série escolar e foto. As crianças não têm endereço de e-mail nem senha conosco. As palavras que uma criança pesquisa, e seu caderno, jogos e progresso, ficam salvos na conta da família. Os pais da família, e qualquer pessoa a quem eles derem acesso, como um tutor, podem vê-los, e um dos pais pode optar por receber alertas, por notificação ou e-mail, com as palavras que a criança pesquisa. Um dos pais pode remover o perfil da criança no aplicativo a qualquer momento."}
      </p>
      <p>
        {"Links de turma: um aluno abre o link ou código fornecido por um professor, sem conta e sem endereço de e-mail. Se o professor tiver inserido uma lista de nomes, o aluno escolhe seu nome nessa lista, e as palavras que o aluno pesquisa ficam salvas para a turma sob esse nome, para que o professor possa vê-las. A escola decide usar o Gadit e é responsável por informar os pais quando a lei exigir isso."}
      </p>
      <p>
        {"Nunca usamos informações de crianças para publicidade, e as ferramentas listadas em Publicidade e análise na seção 3 nunca são carregadas em um perfil infantil, no Modo Infantil ou em páginas de link de turma. Para excluir o perfil de uma criança e seus dados, um dos pais pode escrever para "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" e nós os excluiremos. Se você acredita que uma criança abriu uma conta própria, escreva para nós e excluiremos a conta e seus dados."}
      </p>

      <h2>8. Usuários internacionais</h2>
      <p>
        O Gadit é operado a partir dos Estados Unidos. Se você acessa o serviço de fora dos Estados Unidos, suas
        informações serão transferidas, armazenadas e processadas nos Estados Unidos e nas regiões de data center
        utilizadas pelos nossos provedores de serviço.
      </p>

      <h2>9. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. Alterações relevantes serão publicadas nesta
        página com uma data de &ldquo;Última atualização&rdquo; revisada. O uso contínuo do Gadit após as alterações
        entrarem em vigor constitui aceitação da política atualizada.
      </p>

      <h2>10. Contato</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail: <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyPt() {
  return (
    <>
      <p>
        Bem-vindo ao Gadit. Estes Termos de Uso (&ldquo;Termos&rdquo;) regem seu acesso e uso do site, aplicativos e
        serviços Gadit (em conjunto, o &ldquo;Serviço&rdquo;), operados pela{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;nós&rdquo;, &ldquo;nos&rdquo; ou &ldquo;nosso&rdquo;).
        Ao utilizar o Serviço, você concorda em ficar vinculado a estes Termos. Se você não concorda, não utilize o Serviço.
      </p>

      <h2>1. Quem pode usar o Gadit</h2>
      <p>
        {"Você deve ter 18 anos ou mais para abrir uma conta no Gadit. Crianças e adolescentes menores de 18 anos usam o Gadit apenas por meio de um adulto: um dos pais ou responsável legal pode adicioná-los como perfis no plano Family, e uma escola pode fornecer aos seus alunos um link de turma. O pai, mãe, responsável legal ou escola que concede esse acesso é responsável por ele. Ao abrir uma conta, você confirma que tem 18 anos ou mais."}
      </p>

      <h2>2. Sua conta</h2>
      <p>
        Você é responsável por manter a confidencialidade das suas credenciais de login e por toda atividade que
        ocorrer sob sua conta. Avise-nos imediatamente pelo e-mail{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> se você acredita que
        sua conta foi comprometida.
      </p>

      <h2>3. Assinaturas e cobrança</h2>
      <h3>Planos e tarifas</h3>
      <p>
        {"O Gadit oferece um plano Basic gratuito e planos pagos com os recursos e preços listados na página de preços. Os preços são informados na moeda exibida na página de preços e no checkout para a sua localização (em Israel, novos shekels israelenses, incluindo IVA) e podem ser alterados mediante aviso prévio de pelo menos 30 dias aos assinantes existentes."}
      </p>
      <h3>Renovação automática</h3>
      <p>
        As assinaturas pagas são renovadas automaticamente ao final de cada período de cobrança (mensal ou anual,
        conforme selecionado) pelo preço vigente, a menos que sejam canceladas antes da data de renovação.
      </p>
      <h3>Cancelamento</h3>
      <p>
        {"Você pode cancelar a qualquer momento na página da sua conta. O cancelamento interrompe futuras renovações. Você mantém o acesso aos recursos pagos até o final do período de cobrança atual. Exceto pelos reembolsos descritos abaixo, não reembolsamos tempo não utilizado, salvo quando a lei exigir o contrário."}
      </p>
      <h3>Reembolsos</h3>
      <p>
        {"Se você solicitar em até 14 dias após o primeiro pagamento da sua conta, ou em até 14 dias após uma renovação anual, reembolsaremos esse pagamento integralmente. Você não precisa informar o motivo. Escreva para "}<a href="mailto:support@gadit.app">support@gadit.app</a>{" a partir do endereço de e-mail da sua conta. O reembolso também encerra a assinatura. Os demais pagamentos não são reembolsáveis, exceto quando a lei exigir reembolso. Se você acredita que foi cobrado por engano, escreva para nós em até 30 dias após a cobrança. As compras feitas no aplicativo para iOS são cobradas pela Apple, e somente a Apple pode reembolsá-las, em reportaproblem.apple.com."}
      </p>

      <h2>4. Uso aceitável</h2>
      <p>Você concorda em não:</p>
      <ul>
        <li>usar o Serviço para qualquer finalidade ilegal ou em violação a qualquer lei;</li>
        <li>tentar fazer engenharia reversa, descompilar ou extrair o código-fonte do Serviço;</li>
        <li>abusar, assediar ou prejudicar outros usuários, ou enviar conteúdo de ódio, ameaçador ou obsceno;</li>
        <li>automatizar o acesso ao Serviço além do uso pessoal razoável (por exemplo, extração em massa de definições);</li>
        <li>contornar limites de taxa ou restrições de plano, ou usar várias contas para evitar cotas;</li>
        <li>usar o Serviço para treinar ou ajustar qualquer modelo de IA ou produto de dicionário concorrente;</li>
        <li>enviar ou submeter conteúdo que você não tem o direito de submeter.</li>
      </ul>
      <p>
        Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos.
      </p>

      <h2>5. Conteúdo gerado por IA</h2>
      <p>
        {"O Gadit utiliza modelos de inteligência artificial, incluindo modelos da OpenAI e do Google, para gerar definições, exemplos, etimologias, feedback, quizzes, imagens, fala e transcrições. Você entende e concorda que:"}
      </p>
      <ul>
        <li>
          A saída da IA pode ser <strong>imprecisa, incompleta ou inadequada</strong>. O Gadit é destinado a ser um
          auxílio de aprendizagem e não deve servir como base para decisões legais, médicas, profissionais ou acadêmicas.
        </li>
        <li>
          Definições geradas por IA podem diferir de dicionários oficiais. Não garantimos que toda definição seja
          linguisticamente autorizada.
        </li>
        <li>
          As imagens são geradas algoritmicamente e podem, ocasionalmente, ser inesperadas ou imprecisas. Elas são
          ilustrações, não representações literais.
        </li>
        <li>
          Você é o único responsável pela forma como interpreta e utiliza o conteúdo gerado por IA.
        </li>
      </ul>

      <h2>6. Seu conteúdo</h2>
      <p>
        Ao enviar palavras, frases ou áudio ao Gadit (por exemplo, ao usar &ldquo;Componha sua própria frase&rdquo;
        ou a entrada por voz), você nos concede uma licença mundial, não exclusiva e isenta de royalties para
        processar esse conteúdo com a finalidade de entregar o Serviço e aprimorá-lo. Não reivindicamos a propriedade
        dos seus envios.
      </p>

      <h2>7. Propriedade intelectual</h2>
      <p>
        O nome Gadit, o logotipo, o site e o software subjacente são de nossa propriedade ou propriedade dos nossos
        licenciadores. Concede-se a você uma licença pessoal, revogável e não exclusiva para usar o Serviço conforme
        permitido por estes Termos.
      </p>
      <p>
        O conteúdo gerado pelo Gadit em resposta à sua entrada (definições, imagens, etc.) pode ser usado por você
        para fins pessoais, educacionais ou não comerciais. Para uso comercial (por exemplo, em um produto pago),
        entre em contato conosco.
      </p>

      <h2>8. Disponibilidade e alterações</h2>
      <p>
        Nos esforçamos para manter o Serviço disponível, mas não garantimos operação ininterrupta ou livre de erros.
        Podemos modificar, suspender ou descontinuar qualquer parte do Serviço a qualquer momento, incluindo
        recursos, preços ou disponibilidade em regiões específicas.
      </p>

      <h2>9. Serviços de terceiros</h2>
      <p>
        O Serviço depende de provedores terceirizados (incluindo OpenAI, Google Firebase, Stripe e Vercel). A
        disponibilidade ou o comportamento deles pode afetar sua experiência. Nossa responsabilidade é limitada pela
        Seção 11, independentemente de problemas causados por esses provedores.
      </p>

      <h2>10. Isenção de garantias</h2>
      <p>
        O SERVIÇO É FORNECIDO &ldquo;COMO ESTÁ&rdquo; E &ldquo;CONFORME DISPONÍVEL&rdquo;, SEM GARANTIAS DE QUALQUER
        ESPÉCIE, SEJAM EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A, GARANTIAS DE COMERCIABILIDADE,
        ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA E NÃO VIOLAÇÃO.
      </p>

      <h2>11. Limitação de responsabilidade</h2>
      <p>
        NA MÁXIMA EXTENSÃO PERMITIDA POR LEI, A LAVI LEARNING AND TRAINING TECHNOLOGIES LLC E SEUS DIRETORES,
        FUNCIONÁRIOS E AGENTES NÃO SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS,
        CONSEQUENCIAIS OU PUNITIVOS, NEM POR QUALQUER PERDA DE LUCROS OU RECEITAS, DECORRENTES OU RELACIONADOS AO
        SEU USO DO SERVIÇO.
      </p>
      <p>
        NOSSA RESPONSABILIDADE TOTAL POR QUALQUER REIVINDICAÇÃO DECORRENTE OU RELACIONADA AO SERVIÇO NÃO EXCEDERÁ O
        MAIOR ENTRE (A) O VALOR QUE VOCÊ NOS PAGOU NOS DOZE MESES QUE ANTECEDERAM A REIVINDICAÇÃO, OU (B) USD $100.
      </p>

      <h2>12. Rescisão</h2>
      <p>
        Você pode deixar de usar o Serviço a qualquer momento. Podemos suspender ou encerrar seu acesso se você
        violar estes Termos ou se exigido por lei. Após a rescisão, as disposições que por sua natureza devam
        sobreviver (incluindo as Seções 7, 10, 11 e 14) permanecerão em vigor.
      </p>

      <h2>13. Alterações nestes Termos</h2>
      <p>
        Podemos revisar estes Termos periodicamente. Alterações relevantes serão publicadas nesta página com uma
        data de &ldquo;Última atualização&rdquo; revisada. O uso contínuo do Serviço após as alterações entrarem em
        vigor constitui aceitação dos Termos atualizados.
      </p>

      <h2>14. Legislação aplicável e controvérsias</h2>
      <p>
        Estes Termos são regidos pelas leis do estado de Delaware, Estados Unidos, sem considerar suas regras de
        conflito de leis. Qualquer controvérsia decorrente ou relacionada a estes Termos ou ao Serviço será
        resolvida exclusivamente nos tribunais estaduais ou federais localizados em Delaware, Estados Unidos, e
        você consente com a jurisdição pessoal desses tribunais.
      </p>

      <h2>15. Contato</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        E-mail: <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
