import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, CompanyStatus, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    const { 
      role, 
      firstName, lastName, email, password, phone, 
      companyName, companyTaxId, companyAddress, companyPhone, companyEmail,
      companyId, 
      areaId,
      experienceLevel
    } = data;

    const hashedPassword = password; 

    if (role === UserRole.COMPANY_ADMIN) {
      return this.prisma.$transaction(async (tx) => {
        // 1. Crear Empresa usando los nuevos nombres de campos si los hubiera
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

        // 2. Crear Usuario Admin vinculado a esa empresa (id_company_fk)
        const newUser = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: UserRole.COMPANY_ADMIN,
            phone,
            accountStatus: UserStatus.ACTIVE,
            id_company_fk: newCompany.id_company, // USANDO NUEVO NOMBRE
          }
        });

        // 3. Actualizar la empresa para establecer el admin principal (mainAdminId_fk)
        await tx.company.update({
          where: { id_company: newCompany.id_company }, // USANDO NUEVO NOMBRE
          data: { mainAdminId_fk: newUser.id_user } // USANDO NUEVO NOMBRE
        });

        return { user: newUser, company: newCompany };
      });
    }

    if (role === UserRole.EMPLOYEE || role === UserRole.SUPPORT_TECH) {
        if (!companyId) throw new Error('Company ID is required for employees/techs');

        const userData: any = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role,
            phone,
            accountStatus: UserStatus.ACTIVE,
            id_company_fk: parseInt(companyId), // USANDO NUEVO NOMBRE
        };

        if (role === UserRole.EMPLOYEE) {
             if (areaId) userData.id_area_fk = parseInt(areaId); // USANDO NUEVO NOMBRE
        }

        if (role === UserRole.SUPPORT_TECH) {
            if (experienceLevel) userData.experienceLevel = experienceLevel;
        }

        const newUser = await this.prisma.user.create({
            data: userData
        });

        return newUser;
    }
  }

  async getCompanies() {
      return this.prisma.company.findMany({
          select: { id_company: true, legalName: true } // USANDO NUEVO NOMBRE
      });
  }
  
  async getAreas(id_company_fk: number) {
      return this.prisma.area.findMany({
          where: { id_company_fk } // USANDO NUEVO NOMBRE
      });
  }
}
