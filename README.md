# Processo de Isenção de Valores e Bolsas (Fluig)

Repository voltado ao controle de versão dos componentes do processo de Isenção de Valores e Solicitação de Bolsas desenvolvido na plataforma **TOTVS Fluig**, integrado aos sistemas legados **Lyceum** (Acadêmico) e **TOTVS Protheus** (ERP).

O objetivo principal deste projeto é automatizar e centralizar as solicitações feitas por alunos e candidatos, otimizando o fluxo de análise do setor de Contas a Receber / Contas a Pagar.

---

## 📌 Visão Geral do Fluxo

O processo gerencia duas frentes distintas de formulários utilizando a mesma inteligência de negócio:
1. **Isenção de Taxas:** Processo focado em mitigar custos de inscrição ou matrícula.
2. **Solicitação de Bolsa e Benefícios:** Controle de descontos estruturados com tabelas dinâmicas via campos *Zoom*.

---

## 🛠️ Detalhes Técnicos e Integrações

As integrações utilizam os serviços REST configurados internamente na arquitetura do Fluig, consumindo diretamente os endpoints mapeados:

### 1. Sistema Acadêmico (Lyceum)
Integrado nativamente para persistência dos dados cadastrais do aluno/candidato ao final do fluxo de bolsas.
* **Dados trafegados:** Nome completo, Curso e Código do candidato.
* **Componentes:** Campos *Zoom* vinculados a Datasets customizados.

### 2. ERP Financeiro (Protheus)
Utilizado para validações fiscais, validação cadastral e tratamento de alçadas financeiras complexas.
* **Pré-requisito do Fornecedor:** Para que a solicitação de isenção de taxa seja iniciada com sucesso, o aluno/candidato deve estar previamente cadastrado como **Fornecedor** dentro do TOTVS Protheus.
* **Validação de CPF:** Consulta automatizada realizada no início do fluxo para garantir a consistência cadastral e validar o vínculo do fornecedor.
* **Regra de Cashback (Alçada Especial):**
  * **Com Cashback:** O processo desvia automaticamente para uma **alçada especial de aprovação**. Após o de acordo da governança, os dados são integrados ao Protheus.
  * **Sem Cashback:** O fluxo segue a esteira padrão apenas com a integração acadêmica (Lyceum).
 


---

## 🚀 Desafios Superados

* **Homologação de APIs e Arquitetura:** O maior desafio técnico do projeto foi garantir a integridade dos dados trafegados entre os três sistemas (Fluig ↔ Lyceum ↔ Protheus).
* **Testes de Integração:** Toda a camada de serviços foi exaustivamente testada utilizando o **Postman**, mapeando cenários de sucesso e exceção de ponta a ponta para validar a chegada correta dos payloads nas bases finais.

---
##PROCESSO (desenvolvido no bizagi e reformulado no Eclipse)
<img width="811" height="555" alt="image" src="https://github.com/user-attachments/assets/2a6665ab-6c7e-48bf-a0b5-795a4dde4f73" />
