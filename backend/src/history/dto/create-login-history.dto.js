"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLoginHistoryDto = void 0;
const class_validator_1 = require("class-validator");
class CreateLoginHistoryDto {
    userId;
    userIdentifier;
    ipAddress;
    userAgent;
}
exports.CreateLoginHistoryDto = CreateLoginHistoryDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLoginHistoryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLoginHistoryDto.prototype, "userIdentifier", void 0);
__decorate([
    (0, class_validator_1.IsIP)(),
    __metadata("design:type", String)
], CreateLoginHistoryDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoginHistoryDto.prototype, "userAgent", void 0);
//# sourceMappingURL=create-login-history.dto.js.map