# ARQUIVO FONTE DE DADOS - AFD

## Requisitos Gerais

1.  Apresentar o formato predeterminado neste anexo.
2.  Apresentar-se no formato texto, codificado no padrão ASCII da norma
    ISO 8859-1.
3.  Cada linha deve corresponder a um registro, terminando com os
    caracteres 13 e 10 da tabela ASCII da norma ISO 8859-1.
4.  Ordenar os registros pelo Número Sequencial de Registro - NSR.
5.  Não conter linhas em branco.
6.  Tipos de dados:
    -   **N**: numérico
    -   **A**: alfanumérico
    -   **D**: data no formato `AAAA-MM-dd`
    -   **DH**: data e hora no formato `AAAA-MM-ddThh:mm:00ZZZZZ`

### Tipo D

-   AAAA: ano\
-   MM: mês\
-   dd: dia

### Tipo DH

-   AAAA: ano\
-   MM: mês\
-   dd: dia\
-   T: literal "T"\
-   hh: hora (00 a 23)\
-   mm: minutos (00 a 59)\
-   00: segundos fixos\
-   ZZZZZ: fuso horário (sinal + hora + minutos)

7.  Preenchimento à esquerda, completar com espaços à direita.
8.  Registros tipo "1" a "5" devem conter CRC-16 (CRC-16 CCITT-TRUE /
    KERMIT).
    -   Exemplo: "123456789" → 0x2189 → gravar "2189".
9.  Registro tipo "7" utiliza SHA-256.
10. Nome do arquivo:

-   REP-C: AFD + nº fabricação + CNPJ/CPF + REP_C
-   REP-A: AFD + CNPJ/CPF + REP_A
-   REP-P: AFD + nº INPI + CNPJ/CPF + REP_P

------------------------------------------------------------------------

# Estrutura dos Registros

## Registro Tipo "1" -- Cabeçalho

  ------------------------------------------------------------------------------
  Ref       Posição             Tam       Tipo        Conteúdo
  --------- ------------------- --------- ----------- --------------------------
  1         001-009             9         N           "000000000"

  2         010-010             1         N           Tipo do registro = "1"

  3         011-011             1         N           "1" CNPJ / "2" CPF

  4         012-025             14        N           CNPJ ou CPF do empregador

  5         026-039             14        N           CNO ou CAEPF (quando
                                                      existir)

  6         040-189             150       A           Razão social ou nome do
                                                      empregador

  7         190-206             17        N           Número fabricação (REP-C)
                                                      / Nº acordo coletivo
                                                      (REP-A) / Nº INPI (REP-P)

  8         207-216             10        D           Data inicial dos registros

  9         217-226             10        D           Data final dos registros

  10        227-250             24        DH          Data e hora da geração

  11        251-253             3         N           "003"

  12        254-254             1         N           "1" CNPJ / "2" CPF
                                                      fabricante

  13        255-268             14        N           CNPJ ou CPF
                                                      fabricante/desenvolvedor

  14        269-298             30        A           Modelo (REP-C)

  15        299-302             4         A           CRC-16 (hexadecimal sem
                                                      0x)
  ------------------------------------------------------------------------------

Exemplo DH: `2021-04-27T16:44:00-0300`

------------------------------------------------------------------------

## Registro Tipo "2" -- Inclusão/Alteração Identificação Empresa

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ --------------------------
  1     001-009   9     N      NSR
  2     010-010   1     N      Tipo = "2"
  3     011-034   24    DH     Data/hora gravação
  4     035-048   14    N      CPF responsável
  5     049-049   1     N      "1" CNPJ / "2" CPF
  6     050-063   14    N      CNPJ ou CPF empregador
  7     064-077   14    N      CNO ou CAEPF
  8     078-227   150   A      Razão social
  9     228-327   100   A      Local prestação serviços
  10    328-331   4     A      CRC-16

------------------------------------------------------------------------

## Registro Tipo "3" -- Marcação REP-C / REP-A

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ --------------------
  1     001-009   9     N      NSR
  2     010-010   1     A      Tipo = "3"
  3     011-034   24    DH     Data/hora marcação
  4     035-046   12    N      CPF empregado
  5     047-050   4     A      CRC-16

------------------------------------------------------------------------

## Registro Tipo "4" -- Ajuste de Relógio

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ ------------------------
  1     001-009   9     N      NSR
  2     010-010   1     N      Tipo = "4"
  3     011-034   24    DH     Data/hora antes ajuste
  4     035-058   24    DH     Data/hora ajustada
  5     059-069   11    N      CPF responsável
  6     070-073   4     A      CRC-16

------------------------------------------------------------------------

## Registro Tipo "5" -- Inclusão/Alteração/Exclusão Empregado

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ ---------------------------------------------
  1     001-009   9     N      NSR
  2     010-010   1     N      Tipo = "5"
  3     011-034   24    DH     Data/hora gravação
  4     035-035   1     A      "I" inclusão / "A" alteração / "E" exclusão
  5     036-047   12    N      CPF empregado
  6     048-099   52    A      Nome empregado
  7     100-103   4     A      Demais dados identificação
  8     104-114   11    N      CPF responsável
  9     115-118   4     A      CRC-16

------------------------------------------------------------------------

## Registro Tipo "6" -- Eventos Sensíveis

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ --------------------------
  1     001-009   9     N      NSR
  2     010-010   1     N      Tipo = "6"
  3     011-034   24    DH     Data/hora gravação
  4     035-036   2     N      Tipo de evento (01 a 08)

### Tipos de Evento

-   01: abertura do REP por manutenção ou violação (REP-C)
-   02: retorno de energia (REP-C ou REP-P)
-   03: introdução dispositivo memória Porta Fiscal (REP-C)
-   04: retirada dispositivo memória Porta Fiscal (REP-C)
-   05: emissão Relação Instantânea Marcações (REP-C)
-   06: erro de impressão (REP-C)
-   07: disponibilidade de serviço (REP-P)
-   08: indisponibilidade de serviço (REP-P)

------------------------------------------------------------------------

## Registro Tipo "7" -- Marcação REP-P

  -------------------------------------------------------------------------
  Ref       Posição             Tam       Tipo        Conteúdo
  --------- ------------------- --------- ----------- ---------------------
  1         001-009             9         N           NSR

  2         010-010             1         A           Tipo = "7"

  3         011-034             24        DH          Data/hora marcação

  4         035-046             12        N           CPF empregado

  5         047-070             24        DH          Data/hora gravação

  6         071-072             2         N           01 mobile / 02
                                                      browser / 03 desktop
                                                      / 04 dispositivo
                                                      eletrônico / 05 outro

  7         073-073             1         N           0 online / 1 offline

  8         074-137             64        A           Código hash SHA-256
  -------------------------------------------------------------------------

### Base de cálculo do hash

1.  NSR\
2.  Tipo registro\
3.  Data/hora marcação\
4.  CPF empregado\
5.  Data/hora gravação\
6.  Identificador coletor\
7.  Online/offline\
8.  Hash anterior (se existir)

------------------------------------------------------------------------

## Registro Tipo "9" -- Trailer

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ ------------------------
  1     001-009   9     N      "999999999"
  2     010-018   9     N      Qtd registros tipo "2"
  3     019-027   9     N      Qtd registros tipo "3"
  4     028-036   9     N      Qtd registros tipo "4"
  5     037-045   9     N      Qtd registros tipo "5"
  6     046-054   9     N      Qtd registros tipo "6"
  7     055-063   9     N      Qtd registros tipo "7"
  8     064-064   1     N      Tipo = "9"

------------------------------------------------------------------------

## Assinatura Digital

  Ref   Posição   Tam   Tipo   Conteúdo
  ----- --------- ----- ------ --------------------
  1     001-100   100   A      Assinatura digital

Para REP-A e REP-P preencher com: "ASSINATURA_DIGITAL_EM_ARQUIVO_P7S" +
espaços à direita até completar 100 caracteres.
