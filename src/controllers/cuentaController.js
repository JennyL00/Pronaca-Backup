"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuentaController = void 0;
const database_1 = __importDefault(require("../database"));

class CuentaController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cuenta = yield database_1.default.query('SELECT * FROM cuenta');
            const c = yield database_1.default.query('SELECT distinct c2.descripcion_cuenta AS DESCRIPCION_CUENTA, c2.codigo_cuenta AS CODIGO_CUENTA, c2.id_cuenta AS ID_CUENTA FROM Cuenta as c1 LEFT JOIN Cuenta AS c2 ON (c2.cue_id_cuenta = c1.id_cuenta OR c1.id_cuenta = c2.id_cuenta ) ORDER BY c1.cue_id_cuenta ASC, c1.id_cuenta ASC, c2.id_cuenta ASC, c2.cue_id_cuenta ASC')

            res.json(cuenta);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const cuenta = yield database_1.default.query('SELECT * FROM cuenta WHERE id_cuenta = ?', [id]);
            if (cuenta.length > 0) {
                return res.json(cuenta);
            }
            res.status(404).json({ text: "Cuenta doesn't exists" });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.default.query('INSERT INTO CUENTA SET ?', [req.body]);
            res.json({ message: 'Cuenta saved' });
        });
    }

    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('UPDATE cuenta set ? WHERE id_cuenta = ?', [req.body, id]);
            res.json({ message: 'Cuenta was updated' });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('DELETE FROM cuenta WHERE id_cuenta = ?', [id]);
            res.json({ message: 'Cuenta was deleted' });
        });
    }

    //calcular el total de los costos y gastos
    cuentasCostosGastos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            //cuenta costos operativos
            const cuentaCostosOperativos = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Costos operativos"')
            const stringCuentaCostosOperativos = JSON.parse(JSON.stringify(cuentaCostosOperativos))
            //cálculo costos operativos
            const costosOperativos = yield database_1.default.query('SELECT SUM(E.SUELDO) AS SUELDO FROM EMPLEADO E INNER JOIN CARGO_EMPLEADO C ON E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO INNER JOIN DEPARTAMENTO D ON C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO WHERE E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO AND C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO AND D.ID_CUENTA=?', [stringCuentaCostosOperativos[0].ID_CUENTA])
            const stringCostosOperativos = JSON.parse(JSON.stringify(costosOperativos))

            //cuenta gastos nómina
            const cuentaGastosNomina = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Gastos nómina"')
            const stringCuentaGastosNomina = JSON.parse(JSON.stringify(cuentaGastosNomina))
            //cálculo de gastos nómina
            const gastosNomina = yield database_1.default.query('SELECT SUM(E.SUELDO) AS SUELDO FROM EMPLEADO E INNER JOIN CARGO_EMPLEADO C ON E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO INNER JOIN DEPARTAMENTO D ON C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO WHERE E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO AND C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO AND D.ID_CUENTA=?', [stringCuentaGastosNomina[0].ID_CUENTA])
            const stringGastosOperativos = JSON.parse(JSON.stringify(gastosNomina))
            //cuenta de beneficios sociales
            const beneficiosSociales = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Beneficios sociales"')
            const stringBeneficiosSociales = JSON.parse(JSON.stringify(beneficiosSociales))
            //cuenta de nomina
            const pagoNomina = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Pago de nómina"')
            const stringPagoNomina = JSON.parse(JSON.stringify(pagoNomina))

            //Parámetro iess 
            const parametros = yield database_1.default.query('SELECT * FROM PARAMETRO_IESS')
            const stringParametros = JSON.parse(JSON.stringify(parametros))

            //actualizar cuenta costos operativos
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [stringCostosOperativos[0].SUELDO, stringCuentaCostosOperativos[0].ID_CUENTA])
            //actualizar cuenta gastos nómina
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [stringGastosOperativos[0].SUELDO, stringCuentaGastosNomina[0].ID_CUENTA])

            //actualizar datos del empleado
            yield database_1.default.query('UPDATE EMPLEADO SET HORAS_LABORADAS = 0, SUELDO=SUELDO_FIJO')
            yield database_1.default.query('UPDATE EMPLEADO SET SUELDO_NETO = SUELDO-(SUELDO*?)-(SUELDO*?)', [stringParametros[0].VALOR / 100, stringParametros[1].VALOR / 100])
            //monto para el movimiento
            let montoMov = yield database_1.default.query('SELECT SUM(SUELDO*?) as monto FROM EMPLEADO', [stringParametros[0].VALOR / 100])
            let stringMontoMov = JSON.parse(JSON.stringify(montoMov))
            yield database_1.default.query('UPDATE movimiento_empleado m set m.valor_movimiento_empleado=? where m.id_parametro_iess=?', [stringMontoMov[0].monto, stringParametros[0].ID_PARAMETRO_IESS]);
            montoMov = yield database_1.default.query('SELECT SUM(SUELDO*?) as monto FROM EMPLEADO', [stringParametros[1].VALOR / 100])
            stringMontoMov = JSON.parse(JSON.stringify(montoMov))
            //actualizar los valores de los movimientos
            yield database_1.default.query('UPDATE movimiento_empleado m set m.valor_movimiento_empleado=? where m.id_parametro_iess=?', [stringMontoMov[0].monto, stringParametros[1].ID_PARAMETRO_IESS]);
            yield database_1.default.query('UPDATE movimiento_empleado m inner join (SELECT id_movimiento_empleado, SUM(SUELDO_NETO) as monto FROM EMPLEADO) as e on e.id_movimiento_empleado=m.id_movimiento_empleado set m.valor_movimiento_empleado=e.monto where m.id_cuenta=?', [stringPagoNomina[0].ID_CUENTA]);

            //actualizar la cuenta de beneficios 
            yield database_1.default.query('UPDATE cuenta c INNER JOIN (SELECT id_cuenta, SUM(valor_movimiento_empleado) monto FROM movimiento_empleado where descripcion_movimiento_enpleado=? || descripcion_movimiento_enpleado=?) montoBeneficio ON c.id_cuenta = montoBeneficio.id_cuenta SET c.valor_cuenta = montoBeneficio.monto where c.ID_CUENTA=?', [stringParametros[0].NOMBRE_PARAMETRO, stringParametros[1].NOMBRE_PARAMETRO, stringBeneficiosSociales[0].ID_CUENTA]);
            //actualizar la cuenta de pagos de nómina
            yield database_1.default.query('UPDATE cuenta c INNER JOIN movimiento_empleado m on c.id_cuenta = m.id_cuenta SET c.valor_cuenta = m.valor_movimiento_empleado where c.ID_CUENTA=?', [stringPagoNomina[0].ID_CUENTA]);

            //actualizar banco
            yield database_1.default.query('UPDATE banco b set b.saldo=b.saldo-?-? where b.id_banco=?', [stringCostosOperativos[0].SUELDO, stringGastosOperativos[0].SUELDO, id]);
            //actualizar cuenta del banco
            yield database_1.default.query('UPDATE cuenta c inner join banco b on c.id_cuenta=b.id_cuenta set c.valor_cuenta=b.saldo where c.id_cuenta=(select id_cuenta from banco where id_banco=?) and b.id_banco=?', [id, id]);

            res.json({ message: 'cuentas costos actualizadas' });
        });
    }

    cuentasInventario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;

            ////// Cuenta inventario materia prima
            const cuentaMateriaPrima = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Inventario materia prima"')
            const stringCuentaMateriaPrima = JSON.parse(JSON.stringify(cuentaMateriaPrima))

            // Cálculo inventario materia prima
            const materiaPrima = yield database_1.default.query('SELECT SUM(I.PRECIO_ITEM) AS PRECIO_ITEM FROM ITEM I INNER JOIN TIPO_ITEM T ON I.ID_TIPO_ITEM=T.ID_TIPO_ITEM WHERE I.ID_TIPO_ITEM=T.ID_TIPO_ITEM AND T.ID_CUENTA=?', [stringCuentaMateriaPrima[0].ID_CUENTA])
            const stringMateriaPrima = JSON.parse(JSON.stringify(materiaPrima))
            let materiaPrimaPorSumar = stringMateriaPrima[0].PRECIO_ITEM || 0.00;

            // Actualizar cuenta inventario materia prima
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [materiaPrimaPorSumar, stringCuentaMateriaPrima[0].ID_CUENTA])



            ////// Cuenta inventario insumos
            const cuentaInsumos = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Inventario insumos"')
            const stringCuentaInsumos = JSON.parse(JSON.stringify(cuentaInsumos))

            // Cálculo inventario insumos
            const insumos = yield database_1.default.query('SELECT SUM(I.PRECIO_ITEM) AS PRECIO_ITEM FROM ITEM I INNER JOIN TIPO_ITEM T ON I.ID_TIPO_ITEM=T.ID_TIPO_ITEM WHERE I.ID_TIPO_ITEM=T.ID_TIPO_ITEM AND T.ID_CUENTA=?', [stringCuentaInsumos[0].ID_CUENTA])
            const stringInsumos = JSON.parse(JSON.stringify(insumos))
            let insumosPorSumar = stringInsumos[0].PRECIO_ITEM || 0.00;

            // Actualizar cuenta inventario insumos
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [insumosPorSumar, stringCuentaInsumos[0].ID_CUENTA])



            ////// Cuenta inventario producto
            const cuentaProducto = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Inventario producto"')
            const stringCuentaProducto = JSON.parse(JSON.stringify(cuentaProducto))

            // Cálculo inventario producto
            const producto = yield database_1.default.query('SELECT SUM(I.PRECIO_ITEM) AS PRECIO_ITEM FROM ITEM I INNER JOIN TIPO_ITEM T ON I.ID_TIPO_ITEM=T.ID_TIPO_ITEM WHERE I.ID_TIPO_ITEM=T.ID_TIPO_ITEM AND T.ID_CUENTA=?', [stringCuentaProducto[0].ID_CUENTA])
            const stringProducto = JSON.parse(JSON.stringify(producto))
            let productoPorSumar = stringProducto[0].PRECIO_ITEM || 0.00;

            // Actualizar cuenta inventario producto
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [productoPorSumar, stringCuentaProducto[0].ID_CUENTA])


            // Actualización de la cuenta general de Inventario

            // Obtener la suma de los valores de cuenta de inventario
            const inventario = yield database_1.default.query(
                'SELECT SUM(VALOR_CUENTA) AS TOTAL_INVENTARIO FROM CUENTA WHERE DESCRIPCION_CUENTA IN ("Inventario materia prima", "Inventario insumos", "Inventario producto")'
            );

            // Obtener la suma total
            const totalInventario = inventario[0].TOTAL_INVENTARIO;

            // Actualizar la cuenta de inventario
            yield database_1.default.query(
                'UPDATE CUENTA SET VALOR_CUENTA = ? WHERE DESCRIPCION_CUENTA = "Inventario"', [totalInventario]
            );

            res.json({ message: 'cuentas del inventario actualizadas' });
        });
    }

    actualizarIngresos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            //cálculo ingresos productos vendidos
            const ingresosProductosVendidos = yield database_1.default.query('SELECT p.id_cuenta, SUM(d.precio_detalle_pedido) AS monto FROM detalle_pedido d inner join pedido p on d.id_pedido=p.id_pedido where p.pedido_devuelto="Si"')
            const stringIngresosProductosVendidos = JSON.parse(JSON.stringify(ingresosProductosVendidos))
            //cálculo ingresos productos vendidos
            const ingresosProductosDevueltos = yield database_1.default.query('SELECT p.id_cuenta, SUM(d.precio_detalle_pedido) AS monto FROM detalle_pedido d inner join pedido p on d.id_pedido=p.id_pedido where p.pedido_devuelto="No"')
            const stringIngresosProductosDevueltos = JSON.parse(JSON.stringify(ingresosProductosDevueltos))

            //actualizar cuentas ventas

            //actualizar cuentas devoluciones

            //cuenta gastos nómina
            const cuentaGastosNomina = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Gastos nómina"')
            const stringCuentaGastosNomina = JSON.parse(JSON.stringify(cuentaGastosNomina))
            //cálculo de gastos nómina
            const gastosNomina = yield database_1.default.query('SELECT SUM(E.SUELDO) AS SUELDO FROM EMPLEADO E INNER JOIN CARGO_EMPLEADO C ON E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO INNER JOIN DEPARTAMENTO D ON C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO WHERE E.ID_CARGO_EMPLEADO=C.ID_CARGO_EMPLEADO AND C.ID_DEPARTAMENTO=D.ID_DEPARTAMENTO AND D.ID_CUENTA=?', [stringCuentaGastosNomina[0].ID_CUENTA])
            const stringGastosOperativos = JSON.parse(JSON.stringify(gastosNomina))
            //cuenta de beneficios sociales
            const beneficiosSociales = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Beneficios sociales"')
            const stringBeneficiosSociales = JSON.parse(JSON.stringify(beneficiosSociales))
            //cuenta de nomina
            const pagoNomina = yield database_1.default.query('SELECT * FROM CUENTA WHERE DESCRIPCION_CUENTA = "Pago de nómina"')
            const stringPagoNomina = JSON.parse(JSON.stringify(pagoNomina))

            //Parámetro iess 
            const parametros = yield database_1.default.query('SELECT * FROM PARAMETRO_IESS')
            const stringParametros = JSON.parse(JSON.stringify(parametros))

            //actualizar cuenta costos operativos
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [stringCostosOperativos[0].SUELDO, stringCuentaCostosOperativos[0].ID_CUENTA])
            //actualizar cuenta gastos nómina
            yield database_1.default.query('UPDATE cuenta SET VALOR_CUENTA = ? WHERE ID_CUENTA=?', [stringGastosOperativos[0].SUELDO, stringCuentaGastosNomina[0].ID_CUENTA])

            //actualizar datos del empleado
            yield database_1.default.query('UPDATE EMPLEADO SET HORAS_LABORADAS = 0, SUELDO=SUELDO_FIJO')
            yield database_1.default.query('UPDATE EMPLEADO SET SUELDO_NETO = SUELDO-(SUELDO*?)-(SUELDO*?)', [stringParametros[0].VALOR / 100, stringParametros[1].VALOR / 100])
            //monto para el movimiento
            let montoMov = yield database_1.default.query('SELECT SUM(SUELDO*?) as monto FROM EMPLEADO', [stringParametros[0].VALOR / 100])
            let stringMontoMov = JSON.parse(JSON.stringify(montoMov))
            yield database_1.default.query('UPDATE movimiento_empleado m set m.valor_movimiento_empleado=? where m.id_parametro_iess=?', [stringMontoMov[0].monto, stringParametros[0].ID_PARAMETRO_IESS]);
            montoMov = yield database_1.default.query('SELECT SUM(SUELDO*?) as monto FROM EMPLEADO', [stringParametros[1].VALOR / 100])
            stringMontoMov = JSON.parse(JSON.stringify(montoMov))
            //actualizar los valores de los movimientos
            yield database_1.default.query('UPDATE movimiento_empleado m set m.valor_movimiento_empleado=? where m.id_parametro_iess=?', [stringMontoMov[0].monto, stringParametros[1].ID_PARAMETRO_IESS]);
            yield database_1.default.query('UPDATE movimiento_empleado m inner join (SELECT id_movimiento_empleado, SUM(SUELDO_NETO) as monto FROM EMPLEADO) as e on e.id_movimiento_empleado=m.id_movimiento_empleado set m.valor_movimiento_empleado=e.monto where m.id_cuenta=?', [stringPagoNomina[0].ID_CUENTA]);

            //actualizar la cuenta de beneficios 
            yield database_1.default.query('UPDATE cuenta c INNER JOIN (SELECT id_cuenta, SUM(valor_movimiento_empleado) monto FROM movimiento_empleado where descripcion_movimiento_enpleado=? || descripcion_movimiento_enpleado=?) montoBeneficio ON c.id_cuenta = montoBeneficio.id_cuenta SET c.valor_cuenta = montoBeneficio.monto where c.ID_CUENTA=?', [stringParametros[0].NOMBRE_PARAMETRO, stringParametros[1].NOMBRE_PARAMETRO, stringBeneficiosSociales[0].ID_CUENTA]);
            //actualizar la cuenta de pagos de nómina
            yield database_1.default.query('UPDATE cuenta c INNER JOIN movimiento_empleado m on c.id_cuenta = m.id_cuenta SET c.valor_cuenta = m.valor_movimiento_empleado where c.ID_CUENTA=?', [stringPagoNomina[0].ID_CUENTA]);

            //actualizar banco
            yield database_1.default.query('UPDATE banco b set b.saldo=b.saldo-?-? where b.id_banco=?', [stringCostosOperativos[0].SUELDO, stringGastosOperativos[0].SUELDO, id]);
            //actualizar cuenta del banco
            yield database_1.default.query('UPDATE cuenta c inner join banco b on c.id_cuenta=b.id_cuenta set c.valor_cuenta=b.saldo where c.id_cuenta=(select id_cuenta from banco where id_banco=?) and b.id_banco=?', [id, id]);

            res.json({ message: 'cuentas costos actualizadas' });
        });
    }
}
exports.cuentaController = new CuentaController();