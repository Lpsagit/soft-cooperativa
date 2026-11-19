import ExcelJS from 'exceljs';

export async function generateExcelFromArray(data: any[]): Promise<Buffer> {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');

  worksheet.columns = Object.keys(data[0]).map(key => ({
    header: key.toUpperCase(),
    key,
    width: 20,
  }));

  data.forEach(row => worksheet.addRow(row));

  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
  });


  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}


