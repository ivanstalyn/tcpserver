const ItemFactura = require('../itemfactura');

describe('ItemFactura', () => {
  test('genera una trama con longitud esperada y campos formateados', () => {
    const item = new ItemFactura(1);
    const trama = item.getTrama();

    // La trama debe tener exactamente 124 caracteres
    expect(trama.length).toBe(124);

    // Verificar partes fijas: orden(4), codigo(5), producto(20), productoNombre(20)
    const orden = trama.slice(0, 4);
    const codigo = trama.slice(4, 9);
    const producto = trama.slice(9, 29);
    const productoNombre = trama.slice(29, 49);

    expect(orden).toMatch(/^[0-9]{4}$/);
    expect(codigo).toMatch(/^[A-Z0-9]{5}$/);
    expect(producto.length).toBe(20);
    expect(productoNombre.length).toBe(20);

    // Los campos numéricos deben ser dígitos (sin punto) y tener longitud 15
    const cantidad = trama.slice(49, 64);
    const precio = trama.slice(64, 79);
    const subTotal = trama.slice(79, 94);
    const iva = trama.slice(94, 109);
    const total = trama.slice(109, 124);

    [cantidad, precio, subTotal, iva, total].forEach(field => {
      expect(field).toMatch(/^[0-9]+$/);
      expect(field.length).toBe(15);
    });

    // Comprobar relación aritmética: total = subtotal + iva
    const toNumber = s => parseInt(s, 10) / 100; // convertir a valor con 2 decimales
    const subN = toNumber(subTotal);
    const ivaN = toNumber(iva);
    const totalN = toNumber(total);

    // Allow small rounding diffs
    expect(Math.abs((subN + ivaN) - totalN)).toBeLessThan(0.01);
  });
});
