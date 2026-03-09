# Anexo I - Leiaute dos arquivos (com as alterações introduzidas pela Portaria 2233 de 2009)

## 1. Arquivo-Fonte de Dados – AFD

Este arquivo é composto dos seguintes tipos de registro:

### 1.1. Registro tipo “1” - Cabeçalho

| Referência do campo | Posição  | Tamanho | Tipo       | Conteúdo |
|---------------------|----------|---------|------------|----------|
| 1                   | 001-009  | 9       | numérico   | “000000000”. |
| 2                   | 010-010  | 1       | numérico   | Tipo do registro, “1”. |
| 3                   | 011-011  | 1       | numérico   | Tipo de identificador do empregador, “1” para CNPJ ou “2” para CPF. |
| 4                   | 012-025  | 14      | numérico   | CNPJ ou CPF do empregador. |
| 5                   | 026-037  | 12      | numérico   | CEI do empregador, quando existir. |
| 6                   | 038-187  | 150     | alfanumérico | Razão social ou nome do empregador. |
| 7                   | 188-204  | 17      | numérico   | Número de fabricação do REP. |
| 8                   | 205-212  | 8       | numérico   | Data inicial dos registros no arquivo, no formato “ddmmaaaa”. |
| 9                   | 213-220  | 8       | numérico   | Data final dos registros no arquivo, no formato “ddmmaaaa”. |
| 10                  | 221-228  | 8       | numérico   | Data de geração do arquivo, no formato “ddmmaaaa”. |
| 11                  | 229-232  | 4       | numérico   | Horário da geração do arquivo, no formato “hhmm”. |

### 1.2. Registro de inclusão ou alteração da identificação da empresa no REP

| Referência do campo | Posição  | Tamanho | Tipo         | Conteúdo |
|---------------------|----------|---------|--------------|----------|
| 1                   | 001-009  | 9       | numérico     | NSR. |
| 2                   | 010-010  | 1       | numérico     | Tipo do registro, “2”. |
| 3                   | 011-018  | 8       | numérico     | Data da gravação, no formato “ddmmaaaa”. |
| 4                   | 019-022  | 4       | numérico     | Horário da gravação, no formato “hhmm” |
| 5                   | 023-023  | 1       | numérico     | Tipo de identificador do empregador, “1” para CNPJ ou “2” para CPF. |
| 6                   | 024-037  | 14      | numérico     | CNPJ ou CPF do empregador. |
| 7                   | 038-049  | 12      | numérico     | CEI do empregador, quando existir. |
| 8                   | 050-199  | 150     | alfanumérico | Razão social ou nome do empregador. |
| 9                   | 200-299  | 100     | alfanumérico | Local de prestação de serviços. |

### 1.3. Registro de marcação de ponto

| Referência do campo | Posição  | Tamanho | Tipo         | Conteúdo |
|---------------------|----------|---------|--------------|----------|
| 1                   | 001-009  | 9       | numérico     | NSR. |
| 2                   | 010-010  | 1       | alfanumérico | tipo do registro, “3”. |
| 4                   | 011-018  | 8       | numérico     | Data da marcação de ponto, no formato “ddmmaaaa”. |
| 5                   | 019-022  | 4       | alfanumérico | Horário da marcação de ponto, no Formato “hhmm”. |
| 6                   | 023-034  | 12      | numérico     | Número do PIS do empregado. |

### 1.4. Registro de ajuste do relógio de tempo real do REP

| Referência do campo | Posição  | Tamanho | Tipo       | Conteúdo |
|---------------------|----------|---------|------------|----------|
| 1                   | 001-009  | 9       | numérico   | NSR. |
| 2                   | 010-010  | 1       | numérico   | Tipo do registro, “4”. |
| 4                   | 011-018  | 8       | numérico   | Data antes do ajuste, no formato “ddmmaaaa”. |
| 5                   | 019-022  | 4       | numérico   | Horário antes do ajuste, no formato “hhmm”. |
| 6                   | 023-030  | 8       | numérico   | Data ajustada, no formato “ddmmaaaa”. |
| 7                   | 031-034  | 4       | numérico   | Horário ajustado, no formato “hhmm”. |

### 1.5. Registro de inclusão ou alteração ou exclusão de empregado da MT do REP

| Referência do campo | Posição  | Tamanho | Tipo         | Conteúdo |
|---------------------|----------|---------|--------------|----------|
| 1                   | 001-009  | 9       | numérico     | NSR. |
| 2                   | 010-010  | 1       | numérico     | Tipo do registro, “5”. |
| 4                   | 011-018  | 8       | numérico     | Data da gravação do registro, no formato “ddmmaaaa”. |
| 5                   | 019-022  | 4       | numérico     | Horário da gravação do registro, no formato “hhmm”. |
| 6                   | 023-023  | 1       | alfanumérico | Tipo de operação, “I” para inclusão, “A” para alteração e “E” para exclusão. |
| 7                   | 024-035  | 12      | numérico     | Número do PIS do empregado. |
| 8                   | 036-087  | 52      | alfanumérico | Nome do empregado. |

### 1.6. Trailer

| Referência do campo | Posição  | Tamanho | Tipo       | Conteúdo |
|---------------------|----------|---------|------------|----------|
| 1                   | 001-009  | 9       | numérico   | “999999999”. |
| 2                   | 010-018  | 9       | numérico   | Quantidade de registros tipo “2” no arquivo. |
| 3                   | 019-027  | 9       | numérico   | Quantidade de registros tipo “3” no arquivo. |
| 4                   | 028-036  | 9       | numérico   | Quantidade de registros tipo “4” no arquivo. |
| 5                   | 037-045  | 9       | numérico   | Quantidade de registros tipo “5” no arquivo. |
| 6                   | 046-046  | 1       | numérico   | Tipo do registro, “9”. |