const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import correto da OpenAI (versão oficial)
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Cria thread
    const thread = await openai.beta.threads.create();

    // Envia mensagem do usuário
    await openai.beta.threads.messages.create({
      thread_id: thread.id,
      role: 'user',
      content: userMessage,
    });

    // Executa assistant
    const run = await openai.beta.threads.runs.create({
      thread_id: thread.id,
      assistant_id: 'asst_JHDnLa6vwccDIPPPxsG3tfyqQ',
    });

    // Espera o assistant terminar
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve({
        thread_id: thread.id,
        run_id: run.id,
      });
    } while (runStatus.status !== 'completed');

    // Pega mensagens de resposta
    const messages = await openai.beta.threads.messages.list({
      thread_id: thread.id,
    });

    const assistantMessage = messages.data.find(
      msg => msg.role === 'assistant'
    );

    res.json({ response: assistantMessage.content[0].text.value });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: 'Erro ao se comunicar com o ChatGPT' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor do Chatbot está funcionando ✅');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
