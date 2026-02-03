---
author: Lorenzo Henrique Zanetti <lorenzohz>, Matheus Cenerini Jacomini <Mathayuz>
date: 2025-07-22
---

# WASM Invaders

Um clássico jogo de tiro arcade, inspirado no clássico Space Invaders e reimaginado em C para o console de fantasia [WASM-4](https://wasm4.org).


## Descrição

Pilote sua nave na parte inferior da tela e defenda a galáxia contra enxames de alienígenas descendentes. Lute através de ondas infinitas de invasores que se tornam mais rápidos e numerosos a cada nível. Acumule uma pontuação alta e mostre suas habilidades neste jogo de tiro de inspiração retrô!

## Funcionalidades

-   Ondas infinitas com dificuldade progressiva.
-   Movimentação clássica da formação de alienígenas.
-   Contador de pontuação e de ondas na interface.
-   Efeitos de partículas e sons para feedback das ações.
-   Fundo animado com efeito de paralaxe.
-   Sprites, paleta de cores e jingle de vitória customizados.
-   Desenvolvido em C, sem dependências de bibliotecas padrão.

## Controles

| Ação          | Teclado                | Gamepad            |
| :------------ | :--------------------- | :----------------- |
| Mover Nave    | Setas `Esquerda`/`Direita` | D-Pad `Esquerda`/`Direita` |
| Atirar        | `X` ou `Espaço`        | `Botão 1`          |
| Iniciar Jogo  | `Espaço` ou `Clique`   | `Botão 1`          |

## Compilando

Este projeto usa o sistema de compilação padrão do WASM-4. Certifique-se de ter as [ferramentas do WASM-4 configuradas](https://wasm4.org/docs/getting-started/setup?code-lang=c#quickstart).

Para compilar o cartucho, execute:

```shell
make
```

Para rodar o jogo, use o comando:

```shell
w4 run build/cart.wasm
```
