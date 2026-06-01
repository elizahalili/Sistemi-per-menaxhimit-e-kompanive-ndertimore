using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using backend.Entities;
using Task = backend.Entities.Task;

namespace backend.Data
{
    public static class DbInitializer
    {
        public static async System.Threading.Tasks.Task SeedAsync(
            ApplicationDbContext context, 
            UserManager<ApplicationUser> userManager, 
            RoleManager<ApplicationRole> roleManager)
        {
            // 1. Seed Roles
            string[] roles = { "Admin", "Manager", "Worker" };
            foreach (var r in roles)
            {
                if (!await roleManager.RoleExistsAsync(r))
                {
                    await roleManager.CreateAsync(new ApplicationRole(r));
                }
            }

            // 2. Seed Users
            if (!context.Users.Any())
            {
                // Admin User
                var adminUser = new ApplicationUser
                {
                    Emri = "Admin",
                    Mbiemri = "Ndertimi",
                    Email = "admin@ndertimi.com",
                    UserName = "admin@ndertimi.com"
                };
                await userManager.CreateAsync(adminUser, "Admin123!");
                await userManager.AddToRoleAsync(adminUser, "Admin");

                // Manager User
                var managerUser = new ApplicationUser
                {
                    Emri = "Manager",
                    Mbiemri = "Ndertimi",
                    Email = "manager@ndertimi.com",
                    UserName = "manager@ndertimi.com"
                };
                await userManager.CreateAsync(managerUser, "Manager123!");
                await userManager.AddToRoleAsync(managerUser, "Manager");

                // Worker User
                var workerUser = new ApplicationUser
                {
                    Emri = "Worker",
                    Mbiemri = "Ndertimi",
                    Email = "worker@ndertimi.com",
                    UserName = "worker@ndertimi.com"
                };
                await userManager.CreateAsync(workerUser, "Worker123!");
                await userManager.AddToRoleAsync(workerUser, "Worker");
            }

            // 3. Seed Clients
            if (!context.Clients.Any())
            {
                context.Clients.AddRange(
                    new Client { Id = 1, Emri = "Arben", MbiemriKompania = "Limani", Email = "arben.limani@gmail.com", Telefoni = "+383 44 111 222", Adresa = "Rruga UÇK, Prishtinë", LlojiKlientit = "Individual" },
                    new Client { Id = 2, Emri = "Albi", MbiemriKompania = "Alba Group SH.P.K.", Email = "info@albagroup.com", Telefoni = "+383 49 222 333", Adresa = "Zona Industriale, Fushë Kosovë", LlojiKlientit = "Kompani" },
                    new Client { Id = 3, Emri = "Eliza", MbiemriKompania = "Halili", Email = "eliza.halili@live.com", Telefoni = "+383 45 333 444", Adresa = "Lagjja Marigona, Çagllavicë", LlojiKlientit = "Individual" },
                    new Client { Id = 4, Emri = "Valon", MbiemriKompania = "Krasniqi Construction", Email = "valon@krasniqic.com", Telefoni = "+383 44 444 555", Adresa = "Bulevardi Bill Clinton, Prishtinë", LlojiKlientit = "Kompani" }
                );
                context.SaveChanges();
            }

            // 4. Seed Projects
            if (!context.Projects.Any())
            {
                context.Projects.AddRange(
                    new Project { Id = 1, Emertimi = "Rezidenti Elite Marigona", Pershkrimi = "Ndërtimi i një lagjeje rezidenciale me 15 vila luksoze, parqe dhe infrastrukturë.", KlientiId = 3, Lokacioni = "Çagllavicë, Prishtinë", Buxheti = 2500000.00m, DataFillimit = DateTime.Parse("2026-01-10"), DataPerfundimit = DateTime.Parse("2026-12-20"), Statusi = "Ne Progres", ProgresiTotal = 65 },
                    new Project { Id = 2, Emertimi = "Qendra Tregtare Alba Mall", Pershkrimi = "Punimet e strukturës së betonit dhe metalit për qendrën e re tregtare.", KlientiId = 2, Lokacioni = "Zona Industriale, Fushë Kosovë", Buxheti = 4800000.00m, DataFillimit = DateTime.Parse("2025-08-01"), DataPerfundimit = DateTime.Parse("2026-09-30"), Statusi = "Ne Progres", ProgresiTotal = 40 },
                    new Project { Id = 3, Emertimi = "Kompleksi Banesor Rilindja", Pershkrimi = "Ndërtimi i dy blloqeve banesore me 80 njësi banimi, parking nëntokësor.", KlientiId = 4, Lokacioni = "Lagjja e Spitalit, Prishtinë", Buxheti = 3200000.00m, DataFillimit = DateTime.Parse("2026-03-01"), DataPerfundimit = DateTime.Parse("2027-05-15"), Statusi = "Ne Progres", ProgresiTotal = 15 },
                    new Project { Id = 4, Emertimi = "Vila Individuale Gërmia", Pershkrimi = "Rikonstruksion i vilës private pranë parkut kombëtar të Gërmisë.", KlientiId = 1, Lokacioni = "Rruga e Gërmisë, Prishtinë", Buxheti = 350000.00m, DataFillimit = DateTime.Parse("2025-09-01"), DataPerfundimit = DateTime.Parse("2026-02-15"), Statusi = "I Perfunduar", ProgresiTotal = 100 }
                );
                context.SaveChanges();
            }

            // 5. Seed Workers
            if (!context.Workers.Any())
            {
                context.Workers.AddRange(
                    new Worker { Id = 1, Emri = "Fidan", Mbiemri = "Gashi", Email = "fidan.gashi@ndertimi.com", Telefoni = "+383 44 777 888", Profesioni = "Inxhinier Ndërtimi", PagaDitore = 45.00m, DataPunesimit = DateTime.Parse("2022-04-01"), Statusi = "Aktiv" },
                    new Worker { Id = 2, Emri = "Blerim", Mbiemri = "Hoti", Email = "blerim.hoti@ndertimi.com", Telefoni = "+383 49 888 999", Profesioni = "Mjeshtër Armature", PagaDitore = 30.00m, DataPunesimit = DateTime.Parse("2023-02-15"), Statusi = "Aktiv" },
                    new Worker { Id = 3, Emri = "Fatmir", Mbiemri = "Morina", Email = "fatmir.morina@ndertimi.com", Telefoni = "+383 45 123 456", Profesioni = "Mjeshtër Zidari", PagaDitore = 28.00m, DataPunesimit = DateTime.Parse("2024-01-10"), Statusi = "Aktiv" },
                    new Worker { Id = 4, Emri = "Ardit", Mbiemri = "Shala", Email = "ardit.shala@ndertimi.com", Telefoni = "+383 44 987 654", Profesioni = "Instalues Elektrik", PagaDitore = 25.00m, DataPunesimit = DateTime.Parse("2024-05-20"), Statusi = "Aktiv" },
                    new Worker { Id = 5, Emri = "Ilir", Mbiemri = "Peci", Email = "ilir.peci@ndertimi.com", Telefoni = "+383 49 654 321", Profesioni = "Arkitekt", PagaDitore = 50.00m, DataPunesimit = DateTime.Parse("2021-09-01"), Statusi = "Pushim" }
                );
                context.SaveChanges();
            }

            // 6. Seed ProjectPhases
            if (!context.ProjectPhases.Any())
            {
                context.ProjectPhases.AddRange(
                    new ProjectPhase { Id = 1, ProjektiId = 1, Emertimi = "Gërmimi dhe Themelet", Pershkrimi = "Hapja e gropave dhe hedhja e betonit për themelet e 15 vilave.", Rendi = 1, DataFillimit = DateTime.Parse("2026-01-10"), DataPerfundimit = DateTime.Parse("2026-03-15"), Statusi = "E perfunduar", PerqindjaKompletimit = 100 },
                    new ProjectPhase { Id = 2, ProjektiId = 1, Emertimi = "Struktura e Karabinës", Pershkrimi = "Ndërtimi i mureve mbajtëse, kolonave dhe pllakave.", Rendi = 2, DataFillimit = DateTime.Parse("2026-03-16"), DataPerfundimit = DateTime.Parse("2026-07-30"), Statusi = "Ne Progres", PerqindjaKompletimit = 60 },
                    new ProjectPhase { Id = 3, ProjektiId = 1, Emertimi = "Instalimet dhe Suvatimi", Pershkrimi = "Instalimet elektrike, hidraulike, ngrohja qendrore dhe suvatimi.", Rendi = 3, DataFillimit = DateTime.Parse("2026-08-01"), DataPerfundimit = DateTime.Parse("2026-10-15"), Statusi = "E paplanifikuar", PerqindjaKompletimit = 0 },
                    new ProjectPhase { Id = 4, ProjektiId = 2, Emertimi = "Struktura Bazë e Çelikut", Pershkrimi = "Montimi i shtyllave të çelikut dhe strukturës mbajtëse.", Rendi = 1, DataFillimit = DateTime.Parse("2025-08-01"), DataPerfundimit = DateTime.Parse("2025-11-20"), Statusi = "E perfunduar", PerqindjaKompletimit = 100 },
                    new ProjectPhase { Id = 5, ProjektiId = 2, Emertimi = "Guxhimi dhe Muret e Jashtme", Pershkrimi = "Vendosja e paneleve sanduiç dhe fasadës së qelqit.", Rendi = 2, DataFillimit = DateTime.Parse("2025-11-21"), DataPerfundimit = DateTime.Parse("2026-04-30"), Statusi = "Ne Progres", PerqindjaKompletimit = 75 }
                );
                context.SaveChanges();
            }

            // 7. Seed Tasks
            if (!context.Tasks.Any())
            {
                context.Tasks.AddRange(
                    new Task { Id = 1, FazaId = 2, Emertimi = "Armimi i kolonave të vilave 1-5", Pershkrimi = "Lidhja e hekurit sipas specifikave inxhinierike.", Prioriteti = "I larte", DataFillimit = DateTime.Parse("2026-03-20"), DataPerfundimit = DateTime.Parse("2026-04-10"), Statusi = "E perfunduar" },
                    new Task { Id = 2, FazaId = 2, Emertimi = "Betonimi i pllakës së parë", Pershkrimi = "Mbushja me beton e pllakave të vilave 1-5 duke përdorur pompën.", Prioriteti = "I larte", DataFillimit = DateTime.Parse("2026-04-11"), DataPerfundimit = DateTime.Parse("2026-04-30"), Statusi = "E perfunduar" },
                    new Task { Id = 3, FazaId = 2, Emertimi = "Zidimi i mureve të jashtme vilat 6-10", Pershkrimi = "Vendosja e bllokut termo-izolues Ytong sipas standardit.", Prioriteti = "Mesatar", DataFillimit = DateTime.Parse("2026-05-01"), DataPerfundimit = DateTime.Parse("2026-06-15"), Statusi = "Ne Progres" }
                );
                context.SaveChanges();
            }

            // 8. Seed TaskAssignments
            if (!context.TaskAssignments.Any())
            {
                context.TaskAssignments.AddRange(
                    new TaskAssignment { Id = 1, DetyraId = 3, PunetoriId = 3, DataCaktimit = DateTime.Parse("2026-05-01"), OretPunuara = 96 },
                    new TaskAssignment { Id = 2, DetyraId = 3, PunetoriId = 2, DataCaktimit = DateTime.Parse("2026-05-01"), OretPunuara = 80 }
                );
                context.SaveChanges();
            }

            // 9. Seed Suppliers
            if (!context.Suppliers.Any())
            {
                context.Suppliers.AddRange(
                    new Supplier { Id = 1, Emertimi = "Sharrcem", Kontakti = "Ramadan Hoda", Email = "info@sharrcem.com", Telefoni = "+383 290 310 10", Adresa = "Hani i Elezit, Kosovë", Specialiteti = "Çimento dhe Llaç" },
                    new Supplier { Id = 2, Emertimi = "Kastrioti Steel SH.P.K.", Kontakti = "Luan Kastrati", Email = "sales@kastra-steel.com", Telefoni = "+383 44 500 600", Adresa = "Magjistralja Prishtinë-Ferizaj", Specialiteti = "Hekur Ndërtimi dhe Profila" },
                    new Supplier { Id = 3, Emertimi = "Graniti Depo", Kontakti = "Faton Rrustemi", Email = "contact@granitidepo.com", Telefoni = "+383 49 100 200", Adresa = "Llapnasellë, Graçanicë", Specialiteti = "Qeramikë dhe Sanitarí" }
                );
                context.SaveChanges();
            }

            // 10. Seed Materials
            if (!context.Materials.Any())
            {
                context.Materials.AddRange(
                    new Material { Id = 1, Emertimi = "Çimento Sharrcem Profi 42.5", NjesiaMatese = "Thes 25kg", CmimiNjesi = 4.80m, FurnitoriId = 1, SasiaStokut = 350, Kategoria = "Çimento" },
                    new Material { Id = 2, Emertimi = "Hekur Armature FI 12", NjesiaMatese = "Ton", CmimiNjesi = 750.00m, FurnitoriId = 2, SasiaStokut = 8.5, Kategoria = "Metale" },
                    new Material { Id = 3, Emertimi = "Blloqe Ndërtimi Ytong 20cm", NjesiaMatese = "Cope", CmimiNjesi = 1.65m, FurnitoriId = 3, SasiaStokut = 1200, Kategoria = "Zidari" },
                    new Material { Id = 4, Emertimi = "Beton i Gatshëm MB 30", NjesiaMatese = "m3", CmimiNjesi = 65.00m, FurnitoriId = 1, SasiaStokut = 15, Kategoria = "Çimento" }
                );
                context.SaveChanges();
            }

            // 11. Seed MaterialUsages
            if (!context.MaterialUsages.Any())
            {
                context.MaterialUsages.AddRange(
                    new MaterialUsage { Id = 1, ProjektiId = 1, MaterialiId = 4, FazaId = 1, Sasia = 120, DataPerdorimit = DateTime.Parse("2026-02-10") },
                    new MaterialUsage { Id = 2, ProjektiId = 1, MaterialiId = 2, FazaId = 2, Sasia = 3.5, DataPerdorimit = DateTime.Parse("2026-03-25") }
                );
                context.SaveChanges();
            }

            // 12. Seed Equipment
            if (!context.Equipment.Any())
            {
                context.Equipment.AddRange(
                    new Equipment { Id = 1, Emertimi = "Eskavator Caterpillar 320D", Lloji = "Makineri e Rëndë", Statusi = "Ne Pune", KostojaDitore = 180.00m, DataBlerjes = DateTime.Parse("2021-05-12") },
                    new Equipment { Id = 2, Emertimi = "Garrua Kamion MAN 26t", Lloji = "Transport", Statusi = "I Lire", KostojaDitore = 90.00m, DataBlerjes = DateTime.Parse("2020-09-18") },
                    new Equipment { Id = 3, Emertimi = "Mixer Betoni Liebherr", Lloji = "Betonim", Statusi = "Mirembajtje", KostojaDitore = 110.00m, DataBlerjes = DateTime.Parse("2022-11-05") }
                );
                context.SaveChanges();
            }

            // 13. Seed Invoices
            if (!context.Invoices.Any())
            {
                context.Invoices.AddRange(
                    new Invoice { Id = 1, ProjektiId = 1, KlientiId = 3, Shuma = 150000.00m, Pershkrimi = "Kësti i parë i pagesës pas përfundimit të fazës së themeleve.", DataFatures = DateTime.Parse("2026-03-15"), DataPageses = DateTime.Parse("2026-03-20"), Statusi = "E paguar" },
                    new Invoice { Id = 2, ProjektiId = 1, KlientiId = 3, Shuma = 300000.00m, Pershkrimi = "Kësti i dytë i pagesës për punimet e karabinës.", DataFatures = DateTime.Parse("2026-05-15"), DataPageses = null, Statusi = "E papaguar" },
                    new Invoice { Id = 3, ProjektiId = 2, KlientiId = 2, Shuma = 450000.00m, Pershkrimi = "Pagesa e situacionit financiar nr. 3 - çeliku.", DataFatures = DateTime.Parse("2026-04-30"), DataPageses = null, Statusi = "E vonuar" }
                );
                context.SaveChanges();
            }
        }
    }
}
