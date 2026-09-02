"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInventoryBatchDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_inventory_batch_dto_1 = require("./create-inventory-batch.dto");
class UpdateInventoryBatchDto extends (0, mapped_types_1.PartialType)(create_inventory_batch_dto_1.CreateInventoryBatchDto) {
}
exports.UpdateInventoryBatchDto = UpdateInventoryBatchDto;
//# sourceMappingURL=update-inventory-batch.dto.js.map