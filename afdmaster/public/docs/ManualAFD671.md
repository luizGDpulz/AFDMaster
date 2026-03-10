# ARQUIVO FONTE DE DADOS - AFD (Portaria 671)

## O **AFD** deve:

1. Apresentar o formato predeterminado neste anexo.
2. Apresentar-se no formato texto, codificado no padrão ASCII da norma ISO 8859-1.
3. Apresentar-se com cada linha correspondente a um registro, terminando com os caracteres 13 e 10, respectivamente, da tabela ASCII da norma ISO 8859-1.
4. Ordenar os registros pelo Número Sequencial de Registro - **NSR**.
5. Não conter linhas em branco.
6. Os tipos dos dados nos campos podem ser:
   1. **N**: numérico;
   2. **A**: alfanumérico;
   3. **D**: data, no formato **"AAAA-MM-dd"**, onde:
      1. AAAA: ano;
      2. MM: mês;
      3. dd: dia do mês.
   4. **DH**: data e hora, no formato **"AAAA-MM-ddThh:mm:00ZZZZZ"**, onde:
      1. AAAA: ano;
      2. MM: mês;
      3. dd: dia do mês;
      4. **T**: fixo com valor "T";
      5. hh: hora (00 a 23);
      6. mm: minutos (00 a 59);
      7. 00: segundos (fixos com valor "00");
      8. ZZZZZ: fuso horário, onde o primeiro dígito representa o sinal (positivo ou negativo) e os outros quatro dígitos representam a hora e os minutos.
7. O preenchimento dos campos deve se iniciar pela esquerda e posições não utilizadas devem ser preenchidas com espaço.
8. Para os registros dos tipos **"1" a "5"** deve ser gravado o **Código de Verificação de Redundância**, utilizando o **CRC-16 (Cyclic Redundancy Check)** do registro.

    **OBS:** Para o AFD gerado pelo REP-A ou pelo REP-P, deve ser utilizado o padrão **CRC-16 CCITT-TRUE (CRC-16/KERMIT)**.  
    Por exemplo, os 9 caracteres **"123456789"** geram o CRC-16 de valor **0x2189** em hexadecimal com esse algoritmo.  
    Os 4 caracteres hexadecimais do CRC-16 devem ser gravados no campo de CRC do arquivo AFD nesta ordem (**"2189"** no exemplo, que é a representação hexadecimal sem o **"0x"**).

9. O registro do tipo **"7"** deve utilizar o padrão **SHA-256 (Secure Hash Algorithm - 256 bits)** na geração do campo nº 8 (**código hash**).
10. Ser nomeado pela junção da palavra **"AFD"** com:
    1. para o **REP-C**: número de fabricação do REP, CNPJ/CPF do empregador e **"REP_C"**;
    2. para o **REP-A**: CNPJ/CPF do empregador e **"REP_A"**; e
    3. para o **REP-P**: número de registro no INPI, CNPJ/CPF do empregador e **"REP_P"**.

## Este arquivo é composto dos seguintes tipos de registro:

## Registro do tipo "1" - Cabeçalho

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | "000000000". |
| 2 | 010-010 | 1 | N | Tipo do registro. Preencher com "1". |
| 3 | 011-011 | 1 | N | Tipo de identificador do empregador: "1": CNPJ; "2": CPF. |
| 4 | 012-025 | 14 | N | CNPJ ou CPF do empregador. |
| 5 | 026-039 | 14 | N | CNO (Cadastro Nacional de Obras) ou CAEPF  (Cadastro de Atividade Econômica da Pessoa Física), quando existir. |
| 6 | 040-189 | 150 | A | Razão social ou nome do empregador. |
| 7 | 190-206 | 17 | N | Preencher com:<br>- Número de fabricação, no caso de REP-C;<br>- Número do processo do último acordo ou convenção coletiva depositado, no caso de REP-A (caso não haja, informar "99999999999999999");<br>- Número de registro no INPI, no caso de REP-P. |
| 8 | 207-216 | 10 | D | Data inicial dos registros no arquivo. |
| 9 | 217-226 | 10 | D | Data final dos registros no arquivo. |
| 10 | 227-250 | 24 | DH | Data e hora da geração do arquivo. |
| 11 | 251-253 | 3 | N | Versão do leiaute do AFD. Preencher com "003". |
| 12 | 254-254 | 1 | N | Tipo de identificador do fabricante ou desenvolvedor do REP:<br>- "1": CNPJ;<br>- "2": CPF. |
| 13 | 255-268 | 14 | N | CNPJ ou CPF do fabricante ou desenvolvedor do REP. |
| 14 | 269-298 | 30 | A | Modelo, no caso de REP-C. |
| 15 | 299-302 | 4 | A | CRC-16 do registro (representação hexadecimal sem o "0x"). |

**Observação:** Exemplo para o campo tipo **DH** (data e hora): `2021-04-27T16:44:00-0300`.

---

## Registro do tipo "2" - Inclusão ou alteração da identificação da empresa no REP

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | N | Tipo do registro. Preencher com "2". |
| 3 | 011-034 | 24 | DH | Data e hora da gravação do registro. |
| 4 | 035-048 | 14 | N | CPF do responsável pela inclusão ou alteração. |
| 5 | 049-049 | 1 | N | Tipo identificador do empregador:<br>- "1": CNPJ;<br>- "2": CPF. |
| 6 | 050-063 | 14 | N | CNPJ ou CPF do empregador. |
| 7 | 064-077 | 14 | N | CNO (Cadastro Nacional de Obras) ou CAEPF (Cadastro de Atividade Econômica da Pessoa Física), quando existir.  |
| 8 | 078-227 | 150 | A | Razão social ou nome do empregador. |
| 9 | 228-327 | 100 | A | Local de prestação de serviços. |
| 10 | 328-331 | 4 | A | CRC-16 do registro (representação hexadecimal sem o "0x"). |

---

## Registro do tipo "3" - Marcação de ponto para REP-C e REP-A

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | A | Tipo do registro. Preencher com "3". |
| 3 | 011-034 | 24 | DH | Data e hora da marcação de ponto. |
| 4 | 035-046 | 12 | N | CPF do empregado. |
| 5 | 047-050 | 4 | A | CRC-16 do registro (representação hexadecimal sem o "0x"). |

---

## Registro do tipo "4" - Ajuste do relógio

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | N | Tipo do registro. Preencher com "4". |
| 3 | 011-034 | 24 | DH | Data e hora antes do ajuste. |
| 4 | 035-058 | 24 | DH | Data e hora ajustada. |
| 5 | 059-069 | 11 | N | CPF do responsável pela alteração. |
| 6 | 070-073 | 4 | A | CRC-16 do registro (representação hexadecimal sem o "0x"). |

---

## Registro do tipo "5" - Inclusão, alteração ou exclusão de empregado no REP

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | N | Tipo do registro. Preencher com "5". |
| 3 | 011-034 | 24 | DH | Data e hora da gravação do registro. |
| 4 | 035-035 | 1 | A | Tipo de operação:<br>- "I": inclusão;<br>- "A": alteração;<br>- "E": exclusão. |
| 5 | 036-047 | 12 | N | CPF do empregado. |
| 6 | 048-099 | 52 | A | Nome do empregado. |
| 7 | 100-103 | 4 | A | Demais dados de identificação do empregado. |
| 8 | 104-114 | 11 | N | CPF do responsável pela alteração. |
| 9 | 115-118 | 4 | A | CRC-16 do registro (representação hexadecimal sem o "0x"). |

---

## Registro do tipo "6" - Eventos sensíveis do REP

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | N | Tipo do registro. Preencher com "6". |
| 3 | 011-034 | 24 | DH | Data e hora da gravação do registro. |
| 4 | 035-036 | 2 | N | Tipo de evento:<br>- "01": abertura do REP por manutenção ou violação (somente para REP-C);<br>- "02": retorno de energia (REP-C ou REP-P);<br>- "03": introdução de dispositivo externo de memória na Porta Fiscal (somente para REP-C);<br>- "04":  retirada  de  dispositivo  externo  de  memória  na  Porta  Fiscal (somente para REP-C);<br>- "05": emissão da Relação Instantânea de Marcações (somente para REP-C);<br>- "06": erro de impressão (somente para REP-C);<br>- "07": disponibilidade de serviço (somente para REP-P);<br>- "08": indisponibilidade de serviço (somente para REP-P).  |

---

## Registro do tipo "7" - Marcação de ponto para REP-P

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | NSR |
| 2 | 010-010 | 1 | A | Tipo do registro. Preencher com "7". |
| 3 | 011-034 | 24 | DH | Data e hora da marcação de ponto. |
| 4 | 035-046 | 12 | N | CPF do empregado. |
| 5 | 047-070 | 24 | DH | Data e hora de gravação do registro. |
| 6 | 071-072 | 2 | N | Identificador do coletor da marcação:<br> - "01": aplicativo mobile;<br> - "02": browser (navegador internet);<br> - "03": aplicativo desktop;<br> - "04": dispositivo eletrônico;<br> - "05": outro dispositivo eletrônico não especificado acima.  |
| 7 | 073-073 | 1 | N | Informar "0" para marcação on-line ou "1" para marcação off-line. |
| 8 | 074-137 | 64 | A | Código hash. |

Será utilizado o padrão **SHA-256** na geração do **código hash** especificado no campo nº 8, e seu cálculo será feito com base nos dados abaixo: 

1. NSR (campo nº 1); 
2. tipo do registro (campo nº 2); 
3. data e hora da marcação de ponto (campo nº 3); 
4. CPF do empregado (campo nº 4); 
5. data e hora da gravação do registro (campo nº 5); 
6. identificador do coletor da marcação (campo nº 6); 
7. informação se a marcação foi on-line ou off-line (campo nº 7); e 
8. código hash (SHA-256) do registro anterior, caso exista. 

---

## Registro do tipo "9" - Trailer

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-009 | 9 | N | "999999999". |
| 2 | 010-018 | 9 | N | Quantidade de registros do tipo "2" no arquivo. |
| 3 | 019-027 | 9 | N | Quantidade de registros do tipo "3" no arquivo. |
| 4 | 028-036 | 9 | N | Quantidade de registros do tipo "4" no arquivo. |
| 5 | 037-045 | 9 | N | Quantidade de registros do tipo "5" no arquivo. |
| 6 | 046-054 | 9 | N | Quantidade de registros do tipo "6" no arquivo. |
| 7 | 055-063 | 9 | N | Quantidade de registros do tipo "7" no arquivo. |
| 8 | 064-064 | 1 | N | Tipo do registro. Preencher com "9". |

---

## Assinatura digital

| Referência do campo | Posição | Tamanho | Tipo | Conteúdo |
|---|---|---|---|---|
| 1 | 001-100 | 100 | A | Assinatura digital.<br>**OBS:** No caso do **REP-A** e do **REP-P**, preencher com o texto literal **"ASSINATURA_DIGITAL_EM_ARQUIVO_P7S"** e completar com espaços à direita até 100 caracteres. |

