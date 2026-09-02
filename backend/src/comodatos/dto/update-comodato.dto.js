"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateComodatoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_comodato_dto_1 = require("./create-comodato.dto");
class UpdateComodatoDto extends (0, mapped_types_1.PartialType)(create_comodato_dto_1.CreateComodatoDto) {
}
exports.UpdateComodatoDto = UpdateComodatoDto;
//# sourceMappingURL=update-comodato.dto.js.map