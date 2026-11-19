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

  /**
   * Escapa valores dinámicos para evitar que caracteres ingresados
   * por usuarios alteren la estructura HTML del correo.
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
   * Plantilla base compartida. Usa tablas y estilos en línea para
   * mejorar la compatibilidad con Gmail, Outlook y lectores móviles.
   */
  private plantillaCorreo(
    titulo: string,
    preencabezado: string,
    contenido: string,
    tipo: "success" | "danger" | "info" = "info",
  ): string {
    const colorEstado =
      tipo === "success"
        ? "#15803d"
        : tipo === "danger"
          ? "#b91c1c"
          : "#1d4ed8";

    const fondoEstado =
      tipo === "success"
        ? "#f0fdf4"
        : tipo === "danger"
          ? "#fef2f2"
          : "#eff6ff";

    return `<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Language" content="es">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>${this.escaparHtml(titulo)}</title>
</head>
<body lang="es" style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${this.escaparHtml(preencabezado)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px 24px;background-color:#17324d;">
              <p style="margin:0 0 8px;color:#cbd5e1;font-size:10px;font-weight:bold;letter-spacing:2px;">COOPERATIVA DE AHORRO Y CRÉDITO</p>
              <h1 style="margin:0;color:#ffffff;font-size:27px;line-height:1.3;">Papelerito</h1>
              <p style="margin:8px 0 0;color:#cbd5e1;font-size:13px;">Comprometidos con nuestros socios</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 24px 8px;">
              <span style="display:inline-block;padding:7px 13px;border-radius:20px;background-color:${fondoEstado};color:${colorEstado};font-size:11px;font-weight:bold;letter-spacing:.5px;">${this.escaparHtml(titulo).toLocaleUpperCase("es")}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 30px;font-size:15px;line-height:1.75;color:#475569;">
              ${contenido}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;color:#17324d;font-size:14px;font-weight:bold;">Cooperativa Papelerito</p>
              <p style="margin:0 0 14px;color:#64748b;font-size:12px;line-height:1.6;">Ahorro, confianza y compromiso con nuestros socios.</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;">Este mensaje fue generado automáticamente. Por favor, no responda a este correo.<br>© Cooperativa Papelerito. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:11px;text-align:center;">Comunicación oficial para nuestros socios.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private bloqueMonto(
    etiqueta: string,
    valor: string | number,
    destacado = false,
  ): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;background-color:${destacado ? "#f0fdf4" : "#f8fafc"};border:1px solid ${destacado ? "#bbf7d0" : "#e2e8f0"};border-radius:10px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 5px;color:#64748b;font-size:12px;font-weight:bold;">${this.escaparHtml(etiqueta)}</p>
        <p style="margin:0;color:${destacado ? "#15803d" : "#17324d"};font-size:${destacado ? "25px" : "20px"};font-weight:bold;line-height:1.35;">Bs ${this.escaparHtml(valor)}</p>
      </td></tr>
    </table>`;
  }

  async enviarPrestamoAprobado(
    email: string,
    nombreSocio: string,
    monto: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);

    const contenido = `
    <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.8;">
      Estimado/a
      <strong style="color:#17324d;">${nombre}</strong>:
    </p>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 24px;background:#f0fdf4;
      border:1px solid #bbf7d0;border-radius:14px;">
      <tr>
        <td align="center" style="padding:26px 20px;">
          <table role="presentation" cellpadding="0"
            cellspacing="0" border="0">
            <tr>
              <td align="center"
                style="width:58px;height:58px;
                background:#dcfce7;border-radius:50%;
                color:#15803d;font-size:32px;
                font-weight:bold;line-height:58px;">
                &#10003;
              </td>
            </tr>
          </table>

          <p style="margin:16px 0 8px;color:#166534;
            font-size:23px;font-weight:bold;line-height:1.35;">
            ¡Préstamo aprobado!
          </p>

          <p style="margin:0;color:#15803d;
            font-size:14px;line-height:1.7;">
            Su solicitud ha sido aprobada satisfactoriamente.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;color:#475569;
      font-size:15px;line-height:1.8;">
      Nos complace informarle que la Cooperativa Papelerito
      ha aprobado su solicitud de préstamo.
      A continuación, encontrará el monto aprobado.
    </p>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 24px;background:#f0fdf4;
      border:1px solid #bbf7d0;border-radius:14px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 10px;color:#166534;
            font-size:12px;font-weight:bold;letter-spacing:1px;">
            MONTO APROBADO
          </p>

          <p style="margin:0;color:#166534;
            font-size:32px;font-weight:bold;line-height:1.35;
            overflow-wrap:anywhere;">
            Bs ${this.escaparHtml(monto)}
          </p>

          <table role="presentation" cellpadding="0"
            cellspacing="0" border="0"
            style="margin-top:14px;">
            <tr>
              <td style="padding:6px 12px;background:#dcfce7;
                border-radius:20px;color:#166534;
                font-size:12px;font-weight:bold;">
                &#10003; APROBADO
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 22px;background:#eff6ff;
      border-left:4px solid #2563eb;border-radius:6px;">
      <tr>
        <td style="padding:18px;">
          <p style="margin:0 0 8px;color:#1e40af;
            font-size:14px;font-weight:bold;">
            Información sobre el desembolso
          </p>

          <p style="margin:0;color:#475569;
            font-size:13px;line-height:1.8;">
            El desembolso se realizará de acuerdo con el
            procedimiento administrativo de la cooperativa.
            Para consultas, comuníquese con la administración.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;color:#475569;
      font-size:14px;line-height:1.8;">
      Agradecemos la confianza que deposita en nuestra
      cooperativa. Seguimos comprometidos con el bienestar
      y el crecimiento de nuestros socios.
    </p>

    <p style="margin:20px 0 0;color:#17324d;
      font-size:14px;line-height:1.8;">
      Atentamente,<br>
      <strong>Cooperativa de Ahorro y Crédito Papelerito</strong>
    </p>
  `;

    await this.enviarCorreo(
      email,
      "¡Préstamo aprobado! | Cooperativa Papelerito",
      this.plantillaCorreo(
        "Préstamo aprobado",
        "Su solicitud de préstamo ha sido aprobada. Consulte el monto autorizado.",
        contenido,
        "success",
      ),
    );
  }

  async enviarPrestamoRechazado(
    email: string,
    nombreSocio: string,
    motivo?: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const bloqueMotivo = motivo
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:#fff7f7;border:1px solid #fecaca;border-radius:10px;">
          <tr><td style="padding:16px 18px;border-left:4px solid #dc2626;">
            <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:bold;">Motivo del rechazo</p>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;overflow-wrap:anywhere;">${this.escaparHtml(motivo)}</p>
          </td></tr>
        </table>`
      : "";
    const contenido = `
      <p style="margin:0 0 16px;">Estimado/a <strong style="color:#17324d;">${nombre}</strong>:</p>
      <p style="margin:0 0 16px;">Le informamos que, después de la revisión correspondiente, su solicitud de préstamo no ha sido aprobada en esta oportunidad.</p>
      ${bloqueMotivo}
      <p style="margin:16px 0;">Si necesita más información sobre esta decisión, puede comunicarse con la administración de la Cooperativa Papelerito.</p>
      <p style="margin:0;">Agradecemos su comprensión y la confianza depositada en nuestra cooperativa.</p>`;
    await this.enviarCorreo(
      email,
      "Solicitud de préstamo rechazada",
      this.plantillaCorreo(
        "Solicitud no aprobada",
        "Información sobre el resultado de su solicitud de préstamo.",
        contenido,
        "danger",
      ),
    );
  }

  async enviarRefinanciamientoAprobado(
    email: string,
    nombreSocio: string,
    montoPendienteAnterior: string,
    montoDesembolsado: string,
    nuevoMontoPrestamo: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const contenido = `
      <p style="margin:0 0 16px;">Estimado/a <strong style="color:#17324d;">${nombre}</strong>:</p>
      <p style="margin:0 0 18px;">Le informamos que su solicitud de <strong>refinanciamiento de préstamo</strong> ha sido aprobada correctamente.</p>
      ${this.bloqueMonto("Saldo pendiente del préstamo anterior", montoPendienteAnterior)}
      ${this.bloqueMonto("Monto adicional desembolsado", montoDesembolsado)}
      ${this.bloqueMonto("Nuevo monto del préstamo", nuevoMontoPrestamo, true)}
      <p style="margin:18px 0;">El refinanciamiento ha sido registrado correctamente. El nuevo préstamo y su plan de pagos se encuentran registrados en el sistema.</p>
      <p style="margin:0;color:#64748b;font-size:13px;">Si tiene alguna duda, puede comunicarse con la administración de la cooperativa.</p>`;
    await this.enviarCorreo(
      email,
      "Refinanciamiento aprobado",
      this.plantillaCorreo(
        "Refinanciamiento aprobado",
        "Su solicitud de refinanciamiento ha sido aprobada.",
        contenido,
        "success",
      ),
    );
  }

  async enviarAmortizacionAprobado(
    email: string,
    nombreSocio: string,
    saldoAnterior: string,
    montoAmortizacion: string,
    saldoActual: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const contenido = `
      <p style="margin:0 0 16px;">Estimado/a <strong style="color:#17324d;">${nombre}</strong>:</p>
      <p style="margin:0 0 18px;">Le informamos que su <strong>amortización de préstamo</strong> ha sido registrada correctamente.</p>
      ${this.bloqueMonto("Saldo anterior", saldoAnterior)}
      ${this.bloqueMonto("Monto amortizado", montoAmortizacion)}
      ${this.bloqueMonto("Saldo actual del préstamo", saldoActual, true)}
      <p style="margin:18px 0;">El pago realizado ha sido aplicado correctamente al saldo de su préstamo.</p>
      <p style="margin:0 0 16px;">Puede consultar el detalle y el estado actualizado de su préstamo a través del sistema de la Cooperativa.</p>
      <p style="margin:0;color:#64748b;font-size:13px;">Atentamente,<br><strong style="color:#17324d;">Cooperativa Papelerito</strong></p>`;
    await this.enviarCorreo(
      email,
      "Amortización aprobada",
      this.plantillaCorreo(
        "Amortización registrada",
        "Su amortización de préstamo ha sido registrada correctamente.",
        contenido,
        "success",
      ),
    );
  }

  /**
   * Notifica una nueva solicitud de préstamo al correo administrador.
   */
  async enviarSolicitudPrestamo(
    nombreSocio: string,
    montoSolicitado: string,
    plazoMeses: number,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const monto = this.escaparHtml(montoSolicitado);
    const plazo = this.escaparHtml(plazoMeses);

    const contenido = `
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
      Se ha registrado una nueva solicitud de préstamo.
      Es necesario revisar la información en el sistema de administración.
    </p>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 20px;background:#eff6ff;
      border:1px solid #bfdbfe;border-radius:14px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 8px;color:#1d4ed8;
            font-size:12px;font-weight:bold;letter-spacing:1px;">
            MONTO SOLICITADO
          </p>
          <p style="margin:0;color:#17324d;
            font-size:32px;font-weight:bold;line-height:1.3;">
            Bs ${monto}
          </p>
          <p style="margin:8px 0 0;color:#64748b;font-size:12px;">
            Solicitud pendiente de evaluación
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 20px;background:#ffffff;
      border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 6px;color:#64748b;
            font-size:11px;font-weight:bold;letter-spacing:.7px;">
            SOCIO SOLICITANTE
          </p>
          <p style="margin:0 0 20px;color:#17324d;
            font-size:17px;font-weight:bold;overflow-wrap:anywhere;">
            ${nombre}
          </p>

          <p style="margin:0 0 6px;color:#64748b;
            font-size:11px;font-weight:bold;letter-spacing:.7px;">
            PLAZO SOLICITADO
          </p>
          <p style="margin:0;color:#17324d;
            font-size:17px;font-weight:bold;">
            ${plazo} meses
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0"
      cellspacing="0" border="0"
      style="margin:0 0 20px;background:#f8fafc;
      border-left:4px solid #2563eb;border-radius:6px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 6px;color:#17324d;
            font-size:14px;font-weight:bold;">
            Acción requerida
          </p>
          <p style="margin:0;color:#475569;
            font-size:13px;line-height:1.7;">
            Acceda al sistema de administración de la Cooperativa
            Papelerito para revisar la solicitud y registrar su decisión.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#64748b;font-size:12px;line-height:1.7;">
      Este mensaje es una notificación automática. La solicitud
      no implica que el préstamo haya sido aprobado.
    </p>
  `;

    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de préstamo | Cooperativa Papelerito",
      this.plantillaCorreo(
        "Nueva solicitud de préstamo",
        "Se ha recibido una nueva solicitud que requiere revisión administrativa.",
        contenido,
        "info",
      ),
    );
  }

  /**
   * Notifica una solicitud de amortización extraordinaria al administrador.
   */
  async enviarSolicitudAmortizacion(
    nombreSocio: string,
    codigoPrestamo: string,
    montoAmortizacion: string,
  ): Promise<void> {
    const nombre = this.escaparHtml(nombreSocio);
    const codigo = this.escaparHtml(codigoPrestamo);
    const contenido = `
      <p style="margin:0 0 16px;">Se ha recibido una nueva solicitud de amortización extraordinaria que requiere revisión.</p>
      <p style="margin:0 0 5px;color:#64748b;font-size:12px;font-weight:bold;">Socio solicitante</p>
      <p style="margin:0 0 18px;color:#17324d;font-size:16px;font-weight:bold;">${nombre}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
        <tr><td style="padding:14px 16px;">
          <p style="margin:0 0 5px;color:#64748b;font-size:12px;font-weight:bold;">Código del préstamo</p>
          <p style="margin:0;color:#17324d;font-size:16px;font-weight:bold;overflow-wrap:anywhere;">${codigo}</p>
        </td></tr>
      </table>
      ${this.bloqueMonto("Monto solicitado para amortizar", montoAmortizacion, true)}
      <p style="margin:18px 0 0;color:#64748b;font-size:13px;">Revise los datos de la solicitud en el sistema de administración.</p>`;
    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de amortización",
      this.plantillaCorreo(
        "Nueva solicitud de amortización",
        "Se ha recibido una solicitud de amortización extraordinaria.",
        contenido,
        "info",
      ),
    );
  }

  /**
   * Notifica una solicitud de refinanciamiento al administrador.
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
    const contenido = `
      <p style="margin:0 0 16px;">Se ha recibido una nueva solicitud de refinanciamiento que requiere revisión.</p>
      <p style="margin:0 0 5px;color:#64748b;font-size:12px;font-weight:bold;">Socio solicitante</p>
      <p style="margin:0 0 18px;color:#17324d;font-size:16px;font-weight:bold;">${nombre}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
        <tr><td style="padding:14px 16px;">
          <p style="margin:0 0 5px;color:#64748b;font-size:12px;font-weight:bold;">Código del préstamo actual</p>
          <p style="margin:0;color:#17324d;font-size:16px;font-weight:bold;overflow-wrap:anywhere;">${codigo}</p>
        </td></tr>
      </table>
      ${this.bloqueMonto("Saldo pendiente anterior", saldoPendiente)}
      ${this.bloqueMonto("Monto adicional solicitado", montoAdicionalSolicitado)}
      ${this.bloqueMonto("Monto total solicitado para el nuevo préstamo", nuevoMontoPrestamo, true)}
      <p style="margin:18px 0 0;color:#64748b;font-size:13px;">Revise los datos de la solicitud en el sistema de administración de la Cooperativa Papelerito.</p>`;
    await this.enviarCorreo(
      envs.MAIL_USER,
      "Nueva solicitud de refinanciamiento",
      this.plantillaCorreo(
        "Nueva solicitud de refinanciamiento",
        "Se ha recibido una nueva solicitud de refinanciamiento.",
        contenido,
        "info",
      ),
    );
  }
}

export const emailService = new EmailService();
