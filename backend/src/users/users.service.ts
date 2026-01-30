import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, CompanyStatus, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Función principal de registro
  async register(data: any) {
    const { 
      role, 
      firstName, lastName, email, password, phone, 
      // Datos de Empresa (solo si es COMPANY_ADMIN)
      companyName, companyTaxId, companyAddress, companyPhone, companyEmail,
      // Datos de vinculación (si NO es COMPANY_ADMIN)
      companyId, 
      // Empleado
      areaId,
      // Técnico
      experienceLevel
    } = data;

    // TODO: Encriptar password aquí (usar bcrypt en el futuro)
    const hashedPassword = password; 

    // LÓGICA 1: Registrar NUEVA EMPRESA y su ADMIN
    if (role === UserRole.COMPANY_ADMIN) {
      // Usamos una transacción para que si falla uno, no se cree nada
      return this.prisma.$transaction(async (tx) => {
        // 1. Crear Empresa
        const newCompany = await tx.company.create({
          data: {
            legalName: companyName,
            taxId: companyTaxId,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            status: CompanyStatus.ACTIVE
          }
        });

        // 2. Crear Usuario Admin vinculado a esa empresa
        const newUser = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: UserRole.COMPANY_ADMIN,
            phone,
            accountStatus: UserStatus.ACTIVE,
            companyId: newCompany.id,
          }
        });

        // 3. Actualizar la empresa para establecer quién es su admin principal
        await tx.company.update({
          where: { id: newCompany.id },
          data: { mainAdminId: newUser.id }
        });

        return { user: newUser, company: newCompany };
      });
    }

    // LÓGICA 2: Registrar EMPLEADO o TÉCNICO en empresa existente
    if (role === UserRole.EMPLOYEE || role === UserRole.SUPPORT_TECH) {
        if (!companyId) throw new Error('Company ID is required for employees/techs');

        const userData: any = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role, // EMPLOYEE o SUPPORT_TECH
            phone,
            accountStatus: UserStatus.ACTIVE,
            companyId: parseInt(companyId), // Asegurar que sea número
        };

        if (role === UserRole.EMPLOYEE) {
             if (areaId) userData.areaId = parseInt(areaId);
        }

        if (role === UserRole.SUPPORT_TECH) {
            if (experienceLevel) userData.experienceLevel = experienceLevel;
            // TODO: Manejar specializations (Array de IDs de áreas)
        }

        const newUser = await this.prisma.user.create({
            data: userData
        });

        return newUser;
    }
  }

  // Helper para obtener empresas (para el select del frontend)
  async getCompanies() {
      return this.prisma.company.findMany({
          select: { id: true, legalName: true }
      });
  }
  
  // Helper para obtener areas de una empresa
  async getAreas(companyId: number) {
      return this.prisma.area.findMany({
          where: { companyId }
      });
  }
}