import nodemailer from "nodemailer";
import { envs } from "../../config/envs";
class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: envs.MAIL_USER,
        pass: envs.MAIL_PASSWORD,
      },
    });
  }

  async enviarCorreo(
    destinatario: string,
    asunto: string,
    html: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"Cooperativa Papelerito" <${envs.MAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html,
    });
  }

  async enviarPrestamoAprobado(
    email: string,
    nombreSocio: string,
    monto: string,
  ): Promise<void> {
    await this.enviarCorreo(
      email,
      "Préstamo aprobado",
      `
        <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 15px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .monto { font-size: 24px; color: #27ae60; font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Préstamo Aprobado</h2>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${nombreSocio}</strong>:</p>
              <p>Le informamos que su solicitud de préstamo fue aprobada correctamente.</p>
              <p><strong>Monto aprobado:</strong></p>
              <p class="monto">Bs ${monto}</p>
              <p>El dinero será depositado en su cuenta en las próximas 24 horas hábiles.</p>
              <hr />
              <p><small>Si tiene alguna duda, contáctenos.</small></p>
            </div>
            <div class="footer">
              <p>Cooperativa Papelerito - Todos los derechos reservados</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
      `,
    );
  }

  //? correo para reachazar prestamo
  async enviarPrestamoRechazado(
    email: string,
    nombreSocio: string,
    motivo?: string,
  ): Promise<void> {
    await this.enviarCorreo(
      email,
      "Solicitud de préstamo rechazada",
      `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }

          .header {
            background: #7f1d1d;
            color: white;
            padding: 15px;
            text-align: center;
          }

          .content {
            padding: 20px;
            border: 1px solid #ddd;
            line-height: 1.6;
          }

          .motivo {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 12px;
            margin: 15px 0;
            color: #7f1d1d;
          }

          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="header">
            <h2>Solicitud de préstamo</h2>
          </div>

          <div class="content">
            <p>Estimado/a <strong>${nombreSocio}</strong>:</p>

            <p>
              Le informamos que, después de la revisión correspondiente,
              su solicitud de préstamo no ha sido aprobada.
            </p>

            ${
              motivo
                ? `
                  <div class="motivo">
                    <strong>Motivo del rechazo:</strong>
                    <p>${motivo}</p>
                  </div>
                `
                : ""
            }

            <p>
              Si necesita mayor información sobre esta decisión,
              puede comunicarse con la administración de la
              Cooperativa Papelerito.
            </p>

            <p>
              Agradecemos su comprensión y confianza en nuestra cooperativa.
            </p>
          </div>

          <div class="footer">
            <p>Cooperativa Papelerito - Todos los derechos reservados</p>
            <p>
              Este es un correo automático, por favor no responder.
            </p>
          </div>
        </div>
      </body>
    </html>
    `,
    );
  }

  async enviarRefinanciamientoAprobado(
    email: string,
    nombreSocio: string,
    montoPendienteAnterior: string,
    montoDesembolsado: string,
    nuevoMontoPrestamo: string,
  ): Promise<void> {
    await this.enviarCorreo(
      email,
      "Refinanciamiento aprobado",
      `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
              }
        
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
        
              .header {
                background: #2c3e50;
                color: white;
                padding: 15px;
                text-align: center;
              }
        
              .content {
                padding: 20px;
                border: 1px solid #ddd;
              }
        
              .monto_ant {
                font-size: 20px;
                color: #277760;
                font-weight: bold;
              }
        
              .monto {
                font-size: 24px;
                color: #27ae60;
                font-weight: bold;
              }
        
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
        
          <body>
            <div class="container">
        
              <div class="header">
                <h2>✅ Refinanciamiento Aprobado</h2>
              </div>
        
              <div class="content">
        
                <p>
                  Estimado/a <strong>${nombreSocio}</strong>:
                </p>
        
                <p>
                  Le informamos que su solicitud de
                  <strong>refinanciamiento de préstamo</strong>
                  ha sido aprobada correctamente.
                </p>
        
        
                <p>
                  <strong>Saldo pendiente del préstamo anterior:</strong>
                </p>
        
                <p class="monto_ant">
                  Bs ${montoPendienteAnterior}
                </p>
        
                <p>
                  <strong>Monto adicional desembolsado:</strong>
                </p>
        
                <p class="monto_ant">
                  Bs ${montoDesembolsado}
                </p>
        
                <p>
                  <strong>Nuevo monto del préstamo:</strong>
                </p>
        
                <p class="monto">
                  Bs ${nuevoMontoPrestamo}
                </p>
        
                <p>
                  El refinanciamiento ha sido registrado correctamente.
                  El nuevo préstamo y su plan de pagos se encuentran registrados en el sistema.
                </p>
        
                <hr />
        
                <p>
                  <small>
                    Si tiene alguna duda, contáctenos.
                  </small>
                </p>
        
              </div>
        
              <div class="footer">
                <p>
                  Cooperativa Papelerito - Todos los derechos reservados
                </p>
        
                <p>
                  Este es un correo automático, por favor no responder.
                </p>
              </div>
        
            </div>
          </body>
        </html>
      `,
    );
  }

  async enviarAmortizacionAprobado(
    email: string,
    nombreSocio: string,
    saldoAnterior: string,
    montoAmortizacion: string,
    saldoActual: string,
  ): Promise<void> {
    await this.enviarCorreo(
      email,
      "Amortización aprobada",
      `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f5f6f8;
                margin: 0;
                padding: 0;
              }
        
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
        
              .header {
                background: #2c3e50;
                color: white;
                padding: 15px;
                text-align: center;
              }
        
              .content {
                padding: 20px;
                border: 1px solid #ddd;
                background-color: #fff;
              }
        
              .monto {
                font-size: 20px;
                color: #277760;
                font-weight: bold;
              }
        
              .saldo {
                font-size: 26px;
                color: #27ae60;
                font-weight: bold;
              }
        
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
        
              .detalle {
                background-color: #f8f9fa;
                border: 1px solid #e5e5e5;
                padding: 15px;
                margin: 20px 0;
              }
            </style>
          </head>
        
          <body>
            <div class="container">
        
              <div class="header">
                <h2>✅ Amortización Registrada</h2>
              </div>
        
              <div class="content">
        
                <p>
                  Estimado/a <strong>${nombreSocio}</strong>:
                </p>
        
                <p>
                  Le informamos que su <strong>amortización de préstamo</strong>
                  ha sido registrada correctamente.
                </p>
        
                <div class="detalle">
        
                  <p>
                    <strong>Saldo anterior:</strong>
                  </p>
        
                  <p class="monto">
                    Bs ${saldoAnterior}
                  </p>
        
                  <p>
                    <strong>Monto amortizado:</strong>
                  </p>
        
                  <p class="monto">
                    Bs ${montoAmortizacion}
                  </p>
        
                  <p>
                    <strong>Saldo actual del préstamo:</strong>
                  </p>
        
                  <p class="saldo">
                    Bs ${saldoActual}
                  </p>
        
                </div>
        
                <p>
                  El pago realizado ha sido aplicado correctamente al
                  saldo de su préstamo.
                </p>
        
                <p>
                  Puede consultar el detalle y el estado actualizado de su
                  préstamo a través del sistema de la Cooperativa.
                </p>
        
                <hr />
        
                <p>
                  <small>
                    Si tiene alguna duda sobre esta operación, contáctenos.
                  </small>
                </p>
        
                <p>
                  Atentamente,<br>
                  <strong>Cooperativa Papelerito</strong>
                </p>
        
              </div>
        
              <div class="footer">
        
                <p>
                  Cooperativa Papelerito - Todos los derechos reservados
                </p>
        
                <p>
                  Este es un correo automático, por favor no responder.
                </p>
        
              </div>
        
            </div>
          </body>
        </html>
      `,
    );
  }

  /**
   * ?Escapa los valores dinámicos para insertarlos de forma segura en HTML.
   */
  private escaparHtml(valor: string | number): string {
    return String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Notifica una nueva solicitud de préstamo.
   * emailDestino: correo del responsable que revisará la solicitud.
   * en nuestro caso se envia al mismo correo de la cooperativa, que es el administrador del sistema.
   * SE PUEDE ANIADIR UN ENLACE DIRECTO CON : <p><a href="http://localhost:5174/prestamos" target="_blank">acceso directo</a></p>
   */
  async enviarSolicitudPrestamo(
    nombreSocio: string,
    montoSolicitado: string,
    plazoMeses: number,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const monto = this.escaparHtml(montoSolicitado);
    const plazo = this.escaparHtml(plazoMeses);

    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de préstamo",
      `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family:Arial,sans-serif;color:#333;background:#f5f6f8;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;">
              <div style="background:#2c3e50;color:#fff;padding:20px;text-align:center;">
                <h2>Nueva solicitud de préstamo</h2>
                <p>Cooperativa de Ahorro y Crédito Papelerito</p>
              </div>
              <div style="padding:24px;">
                <p>Se ha recibido una nueva solicitud de préstamo.</p>
                <p>Socio solicitante: <strong>${nombre}</strong></p>
                <p>Monto solicitado:</p>
                <p style="font-size:24px;color:#277760;font-weight:bold;">
                  Bs ${monto}
                </p>
                <p>Plazo solicitado:<strong> ${plazo} meses</strong></p>
                
                <hr>
              </div>
              <div style="padding:16px;text-align:center;color:#777;font-size:12px;">
                Cooperativa Papelerito<br>
                Notificación automática del sistema.
              </div>
            </div>
          </body>
        </html>
      `,
    );
  }

  /**
   * Notifica una solicitud de amortización extraordinaria.
   * en nuestro caso se envia al mismo correo de la cooperativa, que es el administrador del sistema.
   */
  async enviarSolicitudAmortizacion(
    nombreSocio: string,
    codigoPrestamo: string,
    montoAmortizacion: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const codigo = this.escaparHtml(codigoPrestamo);
    const monto = this.escaparHtml(montoAmortizacion);

    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de amortización",
      `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family:Arial,sans-serif;color:#333;background:#f5f6f8;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;">
              <div style="background:#2c3e50;color:#fff;padding:20px;text-align:center;">
                <h2>Nueva solicitud de amortización</h2>
                <p>Cooperativa de Ahorro y Crédito Papelerito</p>
              </div>
              <div style="padding:24px;">
                <p>Se ha recibido una nueva solicitud de amortización extraordinaria.</p>
                <p><strong>Socio solicitante:</strong> ${nombre}</p>
                <p><strong>Código del préstamo:</strong> ${codigo}</p>
                <p><strong>Monto solicitado para amortizar:</strong></p>
                <p style="font-size:24px;color:#277760;font-weight:bold;">
                  Bs ${monto}
                </p>
                <hr>
              </div>
              <div style="padding:16px;text-align:center;color:#777;font-size:12px;">
                Cooperativa Papelerito<br>
                Notificación automática del sistema.
              </div>
            </div>
          </body>
        </html>
      `,
    );
  }

  /**
   * Notifica una solicitud de refinanciamiento.
   */
  async enviarSolicitudRefinanciamiento(
    nombreSocio: string,
    codigoPrestamo: string,
    saldoPendiente: string,
    montoAdicionalSolicitado: string,
    nuevoMontoPrestamo: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const codigo = this.escaparHtml(codigoPrestamo);
    const saldo = this.escaparHtml(saldoPendiente);
    const adicional = this.escaparHtml(montoAdicionalSolicitado);
    const nuevoMonto = this.escaparHtml(nuevoMontoPrestamo);

    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de refinanciamiento",
      `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family:Arial,sans-serif;color:#333;background:#f5f6f8;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;">
              <div style="background:#2c3e50;color:#fff;padding:20px;text-align:center;">
                <h2>Nueva solicitud de refinanciamiento</h2>
                <p>Cooperativa de Ahorro y Crédito Papelerito</p>
              </div>
              <div style="padding:24px;">
                <p>Se ha recibido una nueva solicitud de refinanciamiento.</p>
                <p><strong>Socio solicitante:</strong> ${nombre}</p>
                <p><strong>Código del préstamo actual:</strong> ${codigo}</p>

                <div style="background:#f8f9fa;border:1px solid #e5e5e5;padding:16px;">
                  <p><strong>Saldo pendiente anterior:</strong></p>
                  <p style="font-size:20px;color:#277760;font-weight:bold;">
                    Bs ${saldo}
                  </p>

                  <p><strong>Monto adicional solicitado:</strong></p>
                  <p style="font-size:20px;color:#277760;font-weight:bold;">
                    Bs ${adicional}
                  </p>

                  <p><strong>Monto total solicitado para el nuevo préstamo:</strong></p>
                  <p style="font-size:24px;color:#27ae60;font-weight:bold;">
                    Bs ${nuevoMonto}
                  </p>
                </div>
                <hr>
              </div>
              <div style="padding:16px;text-align:center;color:#777;font-size:12px;">
                Cooperativa Papelerito<br>
                Notificación automática del sistema.
              </div>
            </div>
          </body>
        </html>
      `,
    );
  }
}

export const emailService = new EmailService();
