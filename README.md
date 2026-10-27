# Ponto Certo

App simples para registrar horários de funcionários.

## O que faz

- Informa o nome do funcionário e o tipo de marcação: entrada, intervalo ou saída.
- Captura a localização no momento em que a foto é tirada, se a permissão for concedida.
- Abre a câmera frontal do celular ou a webcam do computador para tirar uma foto.
- Salva registros e fotos no próprio dispositivo e permite consultar ou excluir marcações.

## Iniciar

```bash
npm install
npx expo start -c
```

Para abrir no computador, pressione `w` no terminal do Expo ou execute `npm run web`. O navegador pedirá permissão para usar a webcam; acesse pelo `localhost` ou por uma página HTTPS.

## Observação

Os registros ficam apenas no aparelho ou navegador em que foram criados. Esta versão ainda não possui login, servidor nem sincronização entre dispositivos.
