export const intakeQuestions: Record<string, {key:string;label:string;options:string[]|null;date:boolean}[]> = {
  "Direito do Consumidor": [
    {
      "key": "empresaReclamada",
      "label": "Empresa reclamada",
      "options": null,
      "date": false
    },
    {
      "key": "produtoServico",
      "label": "Produto/Serviço adquirido",
      "options": null,
      "date": false
    },
    {
      "key": "valorPago",
      "label": "Valor pago (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "dataCompra",
      "label": "Data da compra/contratação",
      "options": null,
      "date": true
    },
    {
      "key": "protocoloAtendimento",
      "label": "Protocolo de atendimento (se houver)",
      "options": null,
      "date": false
    },
    {
      "key": "tentativaSolucao",
      "label": "Houve tentativa de solução?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Trabalhista": [
    {
      "key": "empresa",
      "label": "Nome da empresa",
      "options": null,
      "date": false
    },
    {
      "key": "cargo",
      "label": "Cargo/Função",
      "options": null,
      "date": false
    },
    {
      "key": "admissao",
      "label": "Data de admissão",
      "options": null,
      "date": true
    },
    {
      "key": "demissao",
      "label": "Data de demissão",
      "options": null,
      "date": true
    },
    {
      "key": "salario",
      "label": "Último salário (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "registroCLT",
      "label": "Registro em carteira?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "horasExtras",
      "label": "Teve horas extras?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Previdenciário": [
    {
      "key": "tipoBeneficio",
      "label": "Tipo de benefício (ex: aposentadoria)",
      "options": null,
      "date": false
    },
    {
      "key": "numeroBeneficio",
      "label": "Número do benefício (NB)",
      "options": null,
      "date": false
    },
    {
      "key": "statusINSS",
      "label": "Status no INSS",
      "options": [
        "",
        "Negado",
        "Em análise",
        "Concedido",
        "Revisão"
      ],
      "date": false
    },
    {
      "key": "dataRequerimento",
      "label": "Data do requerimento",
      "options": null,
      "date": true
    }
  ],
  "Família e Sucessões": [
    {
      "key": "tipoDemandaFamilia",
      "label": "Tipo de demanda",
      "options": [
        "",
        "Divórcio",
        "Guarda",
        "Pensão",
        "Inventário",
        "Partilha",
        "União Estável"
      ],
      "date": false
    },
    {
      "key": "criancas",
      "label": "Há crianças menores envolvidas?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "situacaoConvivencia",
      "label": "Situação atual (ex: separado, morando junto)",
      "options": null,
      "date": false
    },
    {
      "key": "bensEnvolvidos",
      "label": "Há bens envolvidos?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "medidaProtetiva",
      "label": "Há medida protetiva?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Cível": [
    {
      "key": "naturezaDano",
      "label": "Natureza da dívida ou dano",
      "options": null,
      "date": false
    },
    {
      "key": "valorEnvolvido",
      "label": "Valor aproximado envolvido (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "existeContrato",
      "label": "Existe contrato?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "haCobrancaJudicial",
      "label": "Há cobrança judicial?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Criminal": [
    {
      "key": "tipoCrime",
      "label": "Tipo de ocorrência (ex: ameaça, furto, etc.)",
      "options": null,
      "date": false
    },
    {
      "key": "dataFato",
      "label": "Data do fato",
      "options": null,
      "date": true
    },
    {
      "key": "existeBO",
      "label": "Existe BO?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "haAudiencia",
      "label": "Já existe audiência?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Imobiliário": [
    {
      "key": "tipoImovel",
      "label": "Tipo de imóvel",
      "options": [
        "",
        "Casa",
        "Apartamento",
        "Terreno",
        "Comercial"
      ],
      "date": false
    },
    {
      "key": "tipoProblemaImobiliario",
      "label": "Tipo de problema",
      "options": [
        "",
        "Locação",
        "Compra e venda",
        "Condomínio",
        "Usucapião",
        "Posse/Despejo"
      ],
      "date": false
    },
    {
      "key": "existeContrato",
      "label": "Existe contrato?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "valorImovel",
      "label": "Valor aproximado do imóvel (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "cidadeUFImovel",
      "label": "Cidade/UF do imóvel",
      "options": null,
      "date": false
    }
  ],
  "Tributário": [
    {
      "key": "tipoTributo",
      "label": "Tipo de tributo (ex: IPTU, ICMS, IR)",
      "options": null,
      "date": false
    },
    {
      "key": "anoCompetencia",
      "label": "Ano de competência",
      "options": null,
      "date": false
    },
    {
      "key": "valorEstimado",
      "label": "Valor estimado (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "temAutoInfracao",
      "label": "Tem auto de infração?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "prazoTributario",
      "label": "Prazo (se houver)",
      "options": null,
      "date": true
    }
  ],
  "Empresarial": [
    {
      "key": "tipoEmpresa",
      "label": "Tipo de empresa",
      "options": [
        "",
        "MEI",
        "ME",
        "EPP",
        "LTDA",
        "S/A"
      ],
      "date": false
    },
    {
      "key": "areaConflito",
      "label": "Área do conflito (ex: societário, contrato, cobrança)",
      "options": null,
      "date": false
    },
    {
      "key": "valorEnvolvidoEmpresarial",
      "label": "Valor envolvido (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "existeContrato",
      "label": "Existe contrato?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "sociosEnvolvidos",
      "label": "Há sócios envolvidos?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Bancário/Financeiro": [
    {
      "key": "nomeBanco",
      "label": "Banco/Instituição",
      "options": null,
      "date": false
    },
    {
      "key": "tipoProblemaBancario",
      "label": "Tipo de problema",
      "options": [
        "",
        "Juros abusivos",
        "Fraude",
        "Consignado",
        "Cartão de crédito",
        "Renegociação",
        "Negativação indevida"
      ],
      "date": false
    },
    {
      "key": "valorCobrado",
      "label": "Valor cobrado (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "existeNegativacao",
      "label": "Houve negativação?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "dataInicioProblema",
      "label": "Início do problema",
      "options": null,
      "date": true
    }
  ],
  "Bancário / Financeiro": [
    {
      "key": "nomeBanco",
      "label": "Banco/Instituição",
      "options": null,
      "date": false
    },
    {
      "key": "tipoProblemaBancario",
      "label": "Tipo de problema",
      "options": [
        "",
        "Juros abusivos",
        "Fraude",
        "Consignado",
        "Cartão de crédito",
        "Renegociação",
        "Negativação indevida"
      ],
      "date": false
    },
    {
      "key": "valorCobrado",
      "label": "Valor cobrado (R$)",
      "options": null,
      "date": false
    },
    {
      "key": "existeNegativacao",
      "label": "Houve negativação?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    },
    {
      "key": "dataInicioProblema",
      "label": "Início do problema",
      "options": null,
      "date": true
    }
  ],
  "Administrativo": [
    {
      "key": "orgaoEnvolvido",
      "label": "Órgão envolvido (ex: INSS, Prefeitura)",
      "options": null,
      "date": false
    },
    {
      "key": "tipoAtoAdministrativo",
      "label": "Tipo de ato (multa, indeferimento...)",
      "options": null,
      "date": false
    },
    {
      "key": "numeroProcessoAdm",
      "label": "Número do processo administrativo (se houver)",
      "options": null,
      "date": false
    },
    {
      "key": "prazoRecurso",
      "label": "Prazo de recurso (se houver)",
      "options": null,
      "date": true
    },
    {
      "key": "temDocumentoOficial",
      "label": "Tem documento oficial?",
      "options": [
        "",
        "Sim",
        "Não"
      ],
      "date": false
    }
  ],
  "Outros": [
    {
      "key": "categoriaOutros",
      "label": "Selecione a categoria",
      "options": [
        "",
        "Ambiental",
        "Direito Digital",
        "Internacional",
        "Marcas e Patentes",
        "Direito da Saúde",
        "Educacional",
        "Direito Eleitoral",
        "Direito Militar",
        "Direito do Trânsito"
      ],
      "date": false
    },
    {
      "key": "descricaoOutros",
      "label": "Descreva brevemente a demanda",
      "options": null,
      "date": false
    }
  ]
};
