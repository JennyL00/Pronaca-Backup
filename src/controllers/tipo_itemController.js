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
exports.tipo_itemController = void 0;
const database_1 = __importDefault(require("../database"));

class Tipo_ItemController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipo_item = yield database_1.default.query('SELECT * FROM tipo_item');
            res.json(tipo_item);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const tipo_item = yield database_1.default.query('SELECT * FROM tipo_item WHERE id_tipo_item = ?', [id]);
            if (tipo_item.length > 0) {
                return res.json(tipo_item);
            }
            res.status(404).json({ text: "Tipo item doesn't exists" });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.default.query('INSERT INTO tipo_item set?', [req.body]);
            res.json({ message: 'Tipo item saved' });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('UPDATE tipo_item set ? WHERE id_tipo_item = ?', [req.body, id]);
            res.json({ message: 'Tipo item was updated' });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('DELETE FROM tipo_item WHERE id_tipo_item = ?', [id]);
            res.json({ message: 'Tipo item was deleted' });
        });
    }
}
exports.tipo_itemController = new Tipo_ItemController();