import { Pool, PoolClient } from "pg";
import PdfPrinter from "pdfmake";
import path from "path";
import fs from "fs";

import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { text } from "stream/consumers";
import { styleText } from "util";
import { generateExcelFromArray } from "../helpers/excelHelper";

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../../fonts/Roboto-Regular.ttf"),
    medium: path.join(__dirname, "../../fonts/Roboto-Medium.ttf"),
    bold: path.join(__dirname, "../../fonts/Roboto-Bold.ttf"),
  },
};

export class ReportService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }
  //*USUARIO NORMAL
  // generar EXTRACTO ahorro desde socio
  // el socio id se puede recuperar del token
  //*esta funcion esutilizada por socios y admin
  public async extractoAhorro(
    socioId: number,
    fechaIni: string,
    fechaFin: string,
  ) {
    try {
      // obtenemos cod_socio con el usuario que viene del token
      //console.log(socioId);
      const sqlSocio = await this.pool.query(
        `SELECT * FROM socio WHERE id = $1 AND is_active = true`,
        [socioId],
      );
      if (sqlSocio.rows.length === 0) {
        throw CustomError.badRequest(
          "El socio fue dado de baja del sistema o no existe",
        );
      }
      //?OBTENEMOS EL ID DE LA CUENTA DE AHORRO DES SOCIO PARA GENERAR EL EXTRACTO
      const sqlCuentaAhorro = await this.pool.query(
        `SELECT id FROM cuenta_ahorro WHERE socio_id = $1`,
        [socioId],
      );

      const { id: cuentaAhorroId } = sqlCuentaAhorro.rows[0];
      const { cod_socio: codSocio } = sqlSocio.rows[0];
      //obtenemos datos para generar el extracto
      //console.log({ cuentaAhorroId, codSocio });
      const extracto = await this.getDataExtractoSocio(
        cuentaAhorroId,
        codSocio,
      );

      //GENERAMOS PDF
      //const rangoFechas = `${this.formatFechaDDMMYYYY(fechaIni)} - ${this.formatFechaDDMMYYYY(fechaFin)}`;

      const printer = new PdfPrinter(fonts);
      const logoPath = path.join(__dirname, "../../assets/lpsa4.png");
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      const fechaActual = this.formatFechaDDMMYYYY(new Date());
      const docDefinition: any = {
        pageSize: "LETTER",

        content: [
          {
            columns: [
              {
                width: 150,
                image: `data:image/png;base64,${logoBase64}`,
                fit: [150, 60],
                margin: [0, -10, 10, 0],
              },

              {
                width: "*",
                stack: [
                  {
                    text: "COOPERATIVA DE AHORRO Y CRÉDITO",
                    fontSize: 14,
                    bold: true,
                    alignment: "center",
                    margin: [-20, 40, 10, 0],
                  },
                  {
                    text: '"PAPELERITO"',
                    fontSize: 12,
                    alignment: "center",
                    margin: [-20, 0, 0, 5],
                  },
                ],
              },

              {
                width: 80,
                qr: `${codSocio}`,
                fit: 50,
                alignment: "right",
              },
            ],
            margin: [0, 0, 0, 30],
          },

          {
            text: "ESTADO DE LA CUENTA DE AHORRO",
            fontSize: 13,
            bold: true,
            alignment: "left",
            color: "#034485",
          },

          {
            text: `Fecha de emisión: ${fechaActual}`,
            fontSize: 10,
            margin: [0, 0, 0, 10],
          },

          {
            columns: [
              {
                width: "60%",

                stack: [
                  {
                    table: {
                      widths: ["30%", "70%"],
                      heights: 20,

                      body: [
                        [
                          {
                            text: "TITULAR:",
                            fillColor: "#f5f5f5",
                            fontSize: 9,
                            bold: true,
                          },
                          {
                            text: extracto.cuentaAhorro[0].nom_completo ?? "-",
                            fontSize: 10,
                          },
                        ],

                        [
                          {
                            text: "N° CUENTA:",
                            fillColor: "#f5f5f5",
                            fontSize: 9,
                            bold: true,
                          },
                          {
                            text: extracto.cuentaAhorro[0].codigo ?? "-",
                            fontSize: 10,
                            bold: true,
                            color: "#0d47a1",
                          },
                        ],
                      ],
                    },

                    layout: {
                      hLineWidth: () => 0.5,
                      vLineWidth: () => 0.5,
                      hLineColor: () => "#e0e0e0",
                      vLineColor: () => "#e0e0e0",
                    },
                  },
                ],
              },

              {
                width: "40%",

                stack: [
                  {
                    table: {
                      widths: ["100%"],

                      body: [
                        [
                          {
                            text: "INFORMACIÓN DE LA CUENTA",
                            fontSize: 10,
                            bold: true,
                            fillColor: "#0d47a1",
                            color: "white",
                            alignment: "center",
                          },
                        ],

                        [
                          {
                            stack: [
                              {
                                columns: [
                                  {
                                    text: "Apertura:",
                                    width: "40%",
                                    fontSize: 9,
                                  },
                                  {
                                    text:
                                      extracto.cuentaAhorro[0]
                                        .fecha_operacion ?? "-",
                                    width: "60%",
                                    fontSize: 9,
                                  },
                                ],
                                margin: [5, 3, 5, 0],
                              },

                              {
                                columns: [
                                  {
                                    text: "Estado:",
                                    width: "40%",
                                    fontSize: 9,
                                  },
                                  {
                                    text:
                                      extracto.cuentaAhorro[0].estado ===
                                      "ACTIVO"
                                        ? "ACTIVA"
                                        : "INACTIVA",

                                    width: "60%",
                                    fontSize: 9,

                                    color:
                                      extracto.cuentaAhorro[0].estado ===
                                      "ACTIVO"
                                        ? "#2e7d32"
                                        : "#c62828",
                                  },
                                ],

                                margin: [5, 2, 5, 3],
                              },
                            ],
                          },
                        ],
                      ],
                    },

                    layout: {
                      hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),

                      vLineWidth: () => 0.5,
                      hLineColor: () => "#e0e0e0",
                      vLineColor: () => "#e0e0e0",
                    },
                  },
                ],
              },
            ],

            margin: [0, 0, 0, 10],
          },
          {
            text: "HISTORIAL DE MOVIMIENTOS",
            fontSize: 10,
            bold: true,
            color: "#034485",
            margin: [0, 5, 0, 5],
          },

          // ============================================================
          // HISTORIAL DE MOVIMIENTOS
          // ============================================================

          {
            margin: [0, 5, 0, 0],

            layout: "lightHorizontalLines",

            table: {
              // AHORA SON 6 COLUMNAS
              widths: [65, "*", 60, 65, 65, 70],

              body: [
                [
                  {
                    text: "Fecha",
                    style: "th",
                  },
                  {
                    text: "Descripción",
                    style: "th",
                  },
                  {
                    text: "Periodo",
                    style: "th",
                  },
                  {
                    text: "Retiro",
                    style: "th",
                    alignment: "right",
                  },
                  {
                    text: "Ingreso",
                    style: "th",
                    alignment: "right",
                  },
                  {
                    text: "Saldo",
                    style: "th",
                    alignment: "right",
                  },
                ],

                ...extracto.movimientos.map((row) => [
                  {
                    text: this.formatFechaDDMMYYYY(row.fecha),
                    style: "td",
                  },

                  {
                    text: row.descripcion ?? "-",
                    style: "td",
                  },

                  {
                    text: row.periodo ?? "-",
                    style: "td",
                    alignment: "center",
                  },

                  {
                    text:
                      row.retiro != null
                        ? Number(row.retiro).toFixed(2)
                        : "0.00",

                    alignment: "right",
                    style: "td",
                  },

                  {
                    text:
                      row.ingreso != null
                        ? Number(row.ingreso).toFixed(2)
                        : "-",

                    alignment: "right",
                    style: "td",
                  },

                  {
                    text:
                      row.saldo_ahorro != null
                        ? Number(row.saldo_ahorro).toFixed(2)
                        : "-",

                    alignment: "right",
                    bold: true,
                    style: "td",
                  },
                ]),

                // ESPACIADOR
                [{}, {}, {}, {}, {}, {}],

                // SALDO ACTUAL
                [
                  {
                    text: "SALDO ACTUAL Bs.:",
                    colSpan: 5,
                    alignment: "right",
                    bold: true,
                    fillColor: "#034485",
                    color: "white",
                    margin: [2, 2],
                  },

                  {},
                  {},
                  {},
                  {},

                  {
                    text:
                      extracto.cuentaAhorro[0].saldo_actual != null
                        ? Number(extracto.cuentaAhorro[0].saldo_actual).toFixed(
                            2,
                          )
                        : "0.00",

                    bold: true,
                    fillColor: "#034485",
                    color: "white",
                    alignment: "right",
                    margin: [2, 2],
                  },
                ],
              ],
            },
          },
        ],

        styles: {
          header: {
            fontSize: 15,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 20],
          },

          subHeader: {
            fontSize: 14,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 20],
          },

          th: {
            fontSize: 9,
            bold: true,
            margin: [2, 3, 2, 3],
          },

          td: {
            fontSize: 8.5,
            margin: [2, 3, 2, 3],
          },
        },
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Uint8Array[] = [];

      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      return new Promise<{ buffer: Buffer; name: string }>(
        (resolve, reject) => {
          pdfDoc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            resolve({ buffer: pdfBuffer, name: `Extracto_ahorro_${codSocio}` });
          });
          pdfDoc.end();
        },
      );
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //**USUARIO ADMINISTRADOR */

  // para regresar lista de descuentos para planilla excel
  public async listaDescuentosPlanilla() {
    const fecha = new Date();

    const fechaFormateada = fecha
      .toLocaleDateString("es-BO", {
        timeZone: "America/La_Paz",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "_");
    //TODO: Poner a todos los prestamos estado en mora

    const sqlDescuentos = await this.pool.query(`
      select s.id, SUBSTRING(s.cod_socio FROM 5)as codigo , s.nom_completo,
         (select count(*) from cuenta_ahorro ca where ca.socio_id = s.id and ca.is_active = true)as descuento_ahorro, 
        COALESCE((select p.cuota_mensual
          from prestamo p 
           where p.socio_id = s.id and p.estado IN ('APROBADO','AMORTIZADO','REFINANCIADO','EN MORA') and p.is_active = true),0) as descuento_prestamo
      from socio s 
      where s.is_active = true 
      `);

    const dataExcel = sqlDescuentos.rows
      .filter((descuento) => {
        const ahorro = parseFloat(descuento.descuento_ahorro) || 0;
        const prestamo = parseFloat(descuento.descuento_prestamo) || 0;
        return ahorro + prestamo !== 0;
      })
      .map((descuento) => ({
        "NUMERO EMPLEADO": descuento.codigo,
        NOMBRE: descuento.nom_completo,
        "DESCUENTO AHORRO": 80.0,
        "DESCUENTO PRESTAMO": descuento.descuento_prestamo,
        TOTAL: 80.0 + parseFloat(descuento.descuento_prestamo),
      }));

    // TODO: REVISAR
    // actualizamos estado del prestamo 'en mora' para nverrificar luego quienes pagaron y quienes no.
    //  for (const descuento of sqlDescuentos.rows) {
    //    await this.pool.query(
    //      `UPDATE prestamo
    //       SET estado = $1
    //       WHERE socio_id = $2 AND is_active = true`,
    //      ["EN MORA", descuento.id],
    //    );
    //  }

    return {
      status: "ok",
      message: "lista para descuento planilla.",
      buffer: await generateExcelFromArray(dataExcel), // envia a helper para generar excel
      name: `Lista_Descuentos_Cooperativa_${fechaFormateada}`,
    };
  }
  //*para el extracto de prestamos
  public async extractoPrestamo(socioId: number, prestamoId: number) {
    try {
      //?verificamos que el socio y el prestamo existan y que el prestamo pertenezca al socio
      const sqlSocio = await this.pool.query(
        `SELECT cod_socio, nom_completo, ci, extencion_ci, is_active FROM socio WHERE id = $1 AND is_active = true`,
        [socioId],
      );
      if (sqlSocio.rows.length === 0) {
        throw CustomError.badRequest(
          "El socio fue dado de baja del sistema o no existe",
        );
      }

      //? datos del socio
      const nomCompleto = sqlSocio.rows[0].nom_completo;
      const codSocio = sqlSocio.rows[0].cod_socio;
      const ci = sqlSocio.rows[0].ci;
      const extencionCi = sqlSocio.rows[0].extencion_ci;

      const sqlPrestamo = await this.pool.query(
        `SELECT codigo, monto_solicitado, is_refinanciado, num_cuotas, fecha_otorgado, saldo_actual, monto_otorgado, is_active, estado 
        FROM prestamo 
        WHERE id = $1 AND socio_id = $2 `,
        [prestamoId, socioId],
      );
      if (sqlPrestamo.rows.length === 0) {
        throw CustomError.badRequest(
          "El prestamo no existe o no pertenece al socio",
        );
      }
      //? datos del prestamo
      const codigo = sqlPrestamo.rows[0].codigo;
      const montoSolicitado = sqlPrestamo.rows[0].monto_solicitado;
      const isRefinanciado = sqlPrestamo.rows[0].is_refinanciado;
      const numCuotas = sqlPrestamo.rows[0].num_cuotas;
      const fechaOtorgado = sqlPrestamo.rows[0].fecha_otorgado;
      const saldoActual = sqlPrestamo.rows[0].saldo_actual;
      const montoOtorgado = sqlPrestamo.rows[0].monto_otorgado;
      const estado = sqlPrestamo.rows[0].estado;

      const extractoPrestamo =
        await this.getDataExtractoSocioPrestamo(prestamoId);

      //? datos pra el archivo pdf
      const printer = new PdfPrinter(fonts);
      const logoPath = path.join(__dirname, "../../assets/lpsa4.png");
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      const fechaActual = this.formatFechaDDMMYYYY(new Date());

      //? archivo pdf
      const docDefinition: any = {
        pageSize: "LETTER",
        content: [
          {
            columns: [
              {
                width: 150,
                image: `data:image/png;base64,${logoBase64}`,
                fit: [150, 60],
                margin: [0, -10, 10, 0],
              },
              {
                width: "*",
                stack: [
                  {
                    text: "COOPERATIVA DE AHORRO Y CRÉDITO",
                    fontSize: 14,
                    bold: true,
                    alignment: "center",
                    margin: [-20, 40, 10, 0],
                  },
                  {
                    text: '"PAPELERITO"',
                    fontSize: 12,
                    alignment: "center",
                    margin: [-20, 0, 0, 5],
                  },
                ],
              },
              {
                width: 80,
                qr: `${codSocio} - ${codigo}`,
                fit: 50,
                alignment: "right",
              },
            ],
            margin: [0, 0, 0, 30],
          },
          {
            text: "ESTADO DE PRÉSTAMO",
            fontSize: 13,
            bold: true,
            alignment: "left",
            color: "#034485",
          },
          {
            text: `Fecha de emisión: ${fechaActual}`,
            fontSize: 9,
            margin: [0, 2, 0, 10],
          },
          {
            columns: [
              {
                width: "55%",
                stack: [
                  {
                    table: {
                      widths: ["32%", "68%"],
                      body: [
                        [
                          {
                            text: "TITULAR:",
                            fillColor: "#f5f5f5",
                            fontSize: 9,
                            bold: true,
                          },
                          {
                            text: nomCompleto,
                            fontSize: 10,
                          },
                        ],
                        [
                          {
                            text: "CÓD. SOCIO:",
                            fillColor: "#f5f5f5",
                            fontSize: 9,
                            bold: true,
                          },
                          {
                            text: codSocio,
                            fontSize: 10,
                            bold: true,
                            color: "#0d47a1",
                          },
                        ],
                        [
                          {
                            text: "C.I.:",
                            fillColor: "#f5f5f5",
                            fontSize: 9,
                            bold: true,
                          },
                          {
                            text: ci,
                            fontSize: 10,
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.5,
                      vLineWidth: () => 0.5,
                      hLineColor: () => "#e0e0e0",
                      vLineColor: () => "#e0e0e0",
                    },
                  },
                ],
              },
              {
                width: "45%",
                stack: [
                  {
                    table: {
                      widths: ["100%"],
                      body: [
                        [
                          {
                            text: "INFORMACIÓN DEL PRÉSTAMO",
                            fontSize: 10,
                            bold: true,
                            fillColor: "#0d47a1",
                            color: "white",
                            alignment: "center",
                          },
                        ],
                        [
                          {
                            stack: [
                              {
                                columns: [
                                  {
                                    text: "Código:",
                                    width: "42%",
                                    fontSize: 9,
                                    bold: true,
                                  },
                                  {
                                    text: codigo,
                                    width: "58%",
                                    fontSize: 9,
                                  },
                                ],
                                margin: [5, 3, 5, 0],
                              },
                              {
                                columns: [
                                  {
                                    text: "Estado:",
                                    width: "42%",
                                    fontSize: 9,
                                    bold: true,
                                  },
                                  {
                                    text: estado,
                                    width: "58%",
                                    fontSize: 9,
                                    bold: true,
                                    color: this.getEstadoColor(estado),
                                  },
                                ],
                                margin: [5, 2, 5, 0],
                              },
                              {
                                columns: [
                                  {
                                    text: "Otorgado:",
                                    width: "42%",
                                    fontSize: 9,
                                    bold: true,
                                  },
                                  {
                                    text: this.formatFechaDDMMYYYY(
                                      fechaOtorgado,
                                    ),
                                    width: "58%",
                                    fontSize: 9,
                                  },
                                ],
                                margin: [5, 2, 5, 0],
                              },
                              {
                                columns: [
                                  {
                                    text: "N° cuotas:",
                                    width: "42%",
                                    fontSize: 9,
                                    bold: true,
                                  },
                                  {
                                    text: String(numCuotas),
                                    width: "58%",
                                    fontSize: 9,
                                  },
                                ],
                                margin: [5, 2, 5, 3],
                              },
                            ],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
                      vLineWidth: () => 0.5,
                      hLineColor: () => "#e0e0e0",
                      vLineColor: () => "#e0e0e0",
                    },
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: "33.33%",
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: "MONTO OTORGADO",
                        alignment: "center",
                        fontSize: 8,
                        bold: true,
                        color: "#555555",
                        margin: [0, 5, 0, 2],
                      },
                    ],
                    [
                      {
                        text: this.formatBs(montoOtorgado),
                        alignment: "center",
                        fontSize: 13,
                        bold: true,
                        color: "#034485",
                        margin: [0, 2, 0, 6],
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5,
                  hLineColor: () => "#dddddd",
                  vLineColor: () => "#dddddd",
                },
              },

              {
                width: "33.33%",
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: "TOTAL PAGADO",
                        alignment: "center",
                        fontSize: 8,
                        bold: true,
                        color: "#555555",
                        margin: [0, 5, 0, 2],
                      },
                    ],
                    [
                      {
                        text: this.formatBs(montoOtorgado - saldoActual),
                        alignment: "center",
                        fontSize: 13,
                        bold: true,
                        color: "#2e7d32",
                        margin: [0, 2, 0, 6],
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5,
                  hLineColor: () => "#dddddd",
                  vLineColor: () => "#dddddd",
                },
              },

              {
                width: "33.34%",
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: "SALDO PENDIENTE",
                        alignment: "center",
                        fontSize: 8,
                        bold: true,
                        color: "#555555",
                        margin: [0, 5, 0, 2],
                      },
                    ],
                    [
                      {
                        text: this.formatBs(saldoActual),
                        alignment: "center",
                        fontSize: 13,
                        bold: true,
                        color: Number(saldoActual) > 0 ? "#c62828" : "#2e7d32",
                        margin: [0, 2, 0, 6],
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5,
                  hLineColor: () => "#dddddd",
                  vLineColor: () => "#dddddd",
                },
              },
            ],
            margin: [0, 15, 0, 15],
          },
          {
            text: "HISTORIAL DE MOVIMIENTOS",
            fontSize: 10,
            bold: true,
            color: "#034485",
            margin: [0, 5, 0, 5],
          },
          {
            layout: "lightHorizontalLines",
            table: {
              headerRows: 1,

              //widths: [55, 85, "*", 60, 60, 75],
              widths: [
                "auto",
                //"auto",
                "*",
                "auto",
                "auto",
                "auto",
              ],

              body: [
                [
                  {
                    text: "Fecha",
                    style: "th",
                  },
                  // {
                  //   text: "Tipo",
                  //   style: "th",
                  // },
                  {
                    text: "Descripción",
                    style: "th",
                  },
                  // {
                  //   text: "Nro.Cuota",
                  //   style: "th",
                  //   alignment: "right",
                  // },
                  {
                    text: "Abono",
                    style: "th",
                    alignment: "right",
                  },
                  {
                    text: "Cargo",
                    style: "th",
                    alignment: "right",
                  },
                  {
                    text: "Saldo",
                    style: "th",
                    alignment: "right",
                  },
                ],

                ...extractoPrestamo.movimientos.map((row: any) => [
                  {
                    text: this.formatFechaDDMMYYYY(row.fecha),
                    style: "td",
                    alignment: "center",
                  },

                  // {
                  //   stack: [
                  //     {
                  //       text: row.tipo_movimiento,
                  //       fontSize: 8,
                  //       bold: row.tipo_movimiento === "DESEMBOLSO",
                  //     },

                  //     ...(row.motivo
                  //       ? [
                  //           {
                  //             text: row.motivo,
                  //             fontSize: 7,
                  //             color: "#666666",
                  //             italics: true,
                  //             margin: [0, 2, 0, 0],
                  //           },
                  //         ]
                  //       : []),
                  //   ],
                  //   style: "td",
                  // },
                  {
                    text: row.descripcion,
                    style: "td",
                  },
                  // {
                  //   text: row.nro_cuota ? String(row.nro_cuota) : "-",
                  //   alignment: "center",
                  //   style: "td",
                  // },

                  {
                    text: this.formatBs(row.abono),
                    alignment: "right",
                    style: "td",
                  },

                  {
                    text: this.formatBs(row.cargo),
                    alignment: "right",
                    style: "td",
                  },

                  {
                    text: this.formatBs(row.saldo_capital),
                    alignment: "right",
                    bold: true,
                    style: "td",
                  },
                ]),

                [
                  {
                    text: "SALDO PENDIENTE Bs.:",
                    colSpan: 4,
                    alignment: "right",
                    bold: true,
                    fillColor: "#034485",
                    color: "white",
                    margin: [2, 4],
                  },
                  //{},
                  // {},
                  {},
                  {},
                  {},

                  {
                    text: this.formatBs(saldoActual),
                    alignment: "right",
                    bold: true,
                    fillColor: "#034485",
                    color: "white",
                    margin: [2, 4],
                  },
                ],
              ],
            },

            margin: [0, 10, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 15,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 0, 20],
          },
          subHeader: {
            fontSize: 14,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 0, 20],
          },
          th: {
            fontSize: 10,
            bold: true,
          },
          td: {
            fontSize: 9.5,
          },
        },
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Uint8Array[] = [];

      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      return new Promise<{ buffer: Buffer; name: string }>(
        (resolve, reject) => {
          pdfDoc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            resolve({ buffer: pdfBuffer, name: `Extracto_prestamo_prueba` });
          });
          pdfDoc.end();
        },
      );
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //************** FUNCIONES INTERNAS *****************/
  // prestamo

  private async getDataExtractoSocioPrestamo(prestamoId: number) {
    const sqlExtractoPrestamo = await this.pool.query(
      `SELECT
           fecha,
           created_at,
           descripcion,
           tipo_movimiento,
           periodo,
           nro_cuota,
       
           -- ABONO: disminuye la deuda del socio
           CASE
               WHEN sentido = 'DISMINUYE' THEN monto
               ELSE NULL
           END AS abono,
       
           -- CARGO: aumenta la deuda del socio
           CASE
               WHEN sentido = 'AUMENTA' THEN monto
               ELSE NULL
           END AS cargo,
       
           -- SALDO ACUMULADO DEL PRÉSTAMO
           SUM(
               CASE
                   WHEN sentido = 'AUMENTA' THEN monto
                   WHEN sentido = 'DISMINUYE' THEN -monto
                   ELSE 0
               END
           ) OVER (
               PARTITION BY prestamo_id
               ORDER BY fecha ASC, id ASC
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS saldo_capital
       
       FROM movimiento_prestamo
       WHERE prestamo_id = $1
       ORDER BY fecha ASC, id ASC;
      `,
      [prestamoId],
    );
    return { movimientos: sqlExtractoPrestamo.rows };
  }

  // ahorro
  private async getDataExtractoSocio(cuentaAhorroId: number, codSocio: string) {
    const sqlExtracto = await this.pool.query(
      `SELECT
           fecha,
           created_at,
           descripcion,
           tipo_operacion,
           periodo,
       
           -- INGRESO: aumenta los ahorros del socio
           CASE
               WHEN sentido = 'AUMENTA' THEN monto
               ELSE NULL
           END AS ingreso,
       
           -- RETIRO: disminuye los ahorros del socio
           CASE
               WHEN sentido = 'DISMINUYE' THEN monto
               ELSE NULL
           END AS retiro,
       
           -- SALDO ACUMULADO DEL AHORRO
           SUM(
               CASE
                   WHEN sentido = 'AUMENTA' THEN monto
                   WHEN sentido = 'DISMINUYE' THEN -monto
                   ELSE 0
               END
           ) OVER (
               PARTITION BY ahorro_id
               ORDER BY fecha ASC, id ASC
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS saldo_ahorro
       
       FROM movimiento_ahorro
       
       WHERE ahorro_id = $1
       
       ORDER BY fecha ASC, id ASC;`,
      [cuentaAhorroId],
    );
    //  OVER (ORDER BY ac.fecha, ad.created_at, ad.id) as saldo_acumulado,
    //  trim(split_part(ac.glosa, '-', 1)) AS glosa
    //  from asiento_detalle ad

    const sqlDataExtracto = await this.pool.query(
      `SELECT 
        s.nom_completo, 
        s.ci, 
        s.extencion_ci , 
        s.cuenta_bancaria , 
        ca.saldo_actual , 
        ca.estado ,
        ca.numero_cuenta , 
        to_char(ca.fecha_operacion, 
        'DD/MM/YYYY')as fecha_operacion, 
        ca.codigo
        FROM socio s
        INNER JOIN cuenta_ahorro ca on s.id = ca.socio_id 
        WHERE s.cod_socio = $1 and ca.is_active = true`,
      [codSocio],
    );

    return {
      movimientos: sqlExtracto.rows,
      cuentaAhorro: sqlDataExtracto.rows,
    };
  }
  // Función para formatear fechas
  private formatFechaDDMMYYYY(dateString: string | Date) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC", // Forzar zona horaria UTC
    });
  }

  private formatBs = (value: number | string | null | undefined) => {
    return Number(value ?? 0).toLocaleString("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  private getEstadoColor = (estado: string) => {
    switch (estado) {
      case "APROBADO":
      case "AMORTIZADO":
        return "#2e7d32";

      case "CANCELADO":
        return "#1565c0";

      case "EN MORA":
        return "#c62828";

      case "REFINANCIADO":
        return "#ef6c00";

      case "RECHAZADO":
        return "#c62828";

      case "EN REVISION":
        return "#f9a825";

      default:
        return "#424242";
    }
  };
}

/*
consulta antiguoa de extracto de prestamos
SELECT 
    fecha,
    created_at,
    
    -- Generamos la descripción automática fija según el tipo de movimiento
    CASE tipo_movimiento
        WHEN 'DESCUENTO PLANILLA' THEN 'Pago de Cuota Nro. ' || COALESCE(nro_cuota::text, '')
        WHEN 'AMORTIZACION' THEN 'Abono extraordinario (Amortización)'
        WHEN 'DESEMBOLSO' THEN 'Desembolso inicial de préstamo'
        WHEN 'AJUSTE' THEN 'Ajuste de cuenta'
        ELSE tipo_movimiento::text
    END AS descripcion,
    
    tipo_movimiento,
    periodo, 
    nro_cuota ,
    -- Si el sentido disminuye el préstamo, para el socio es un ABONO (Ingreso)
    CASE WHEN sentido = 'DISMINUYE' THEN monto ELSE NULL END AS abono,
    
    -- Si el sentido aumenta el préstamo (como un ajuste en contra), es un CARGO (Egreso)
    CASE WHEN sentido = 'AUMENTA' THEN monto ELSE NULL END AS cargo,
    
    -- CALCULADORA DE SALDO PASO A PASO:
    SUM(CASE WHEN sentido = 'AUMENTA' THEN monto ELSE -monto END) 
        OVER (PARTITION BY prestamo_id ORDER BY fecha ASC, id ASC) AS saldo_capital

    FROM movimiento_prestamo
    WHERE prestamo_id = $1
    ORDER BY fecha ASC, id ASC;
*/
/*
CONSULTA ANTIGUA PARA OBTENER EXTRACTO DE AHORROS DESDE TABLAS CONTABLES
select 
       to_char(ac.fecha, 'DD/MM/YYYY') AS fecha, 
       ad.created_at , 
       ad.debe as debito, 
       ad.haber as credito , 
       SUM(COALESCE(ad.haber, 0) - COALESCE(ad.debe, 0)) 
          OVER (ORDER BY ac.fecha, ad.created_at, ad.id) as saldo_acumulado,
       trim(split_part(ac.glosa, '-', 1)) AS glosa
       from asiento_detalle ad
       inner join cuenta_auxiliar ca on ad.cuenta_aux_id = ca.id 
       inner join cuenta_ahorro ch on ca.referencia_id = ch.id 
       inner join socio c on ch.socio_id = c.id 
       inner join asiento_contable ac on ad.asiento_id = ac.id 
       where c.cod_socio = $1 and ca.referencia_tabla = 'cuenta_ahorro' and ac.fecha between $2 and $3
       order by ad.created_at


*/
