using FluentValidation;
using backend.DTOs;

namespace backend.Validators
{
    // ================= AUTH VALIDATORS =================
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Emri).NotEmpty().WithMessage("Emri kërkohet.");
            RuleFor(x => x.Mbiemri).NotEmpty().WithMessage("Mbiemri kërkohet.");
            RuleFor(x => x.Email).NotEmpty().WithMessage("Emaili kërkohet.")
                .EmailAddress().WithMessage("Emaili nuk është i vlefshëm.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Fjalëkalimi kërkohet.")
                .MinimumLength(6).WithMessage("Fjalëkalimi duhet të ketë së paku 6 karaktere.");
        }
    }

    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("Emaili kërkohet.")
                .EmailAddress().WithMessage("Emaili nuk është i vlefshëm.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Fjalëkalimi kërkohet.");
        }
    }

    // ================= CLIENT VALIDATOR =================
    public class ClientCreateUpdateDtoValidator : AbstractValidator<ClientCreateUpdateDto>
    {
        public ClientCreateUpdateDtoValidator()
        {
            RuleFor(x => x.Emri).NotEmpty().WithMessage("Emri kërkohet.");
            RuleFor(x => x.MbiemriKompania).NotEmpty().WithMessage("Emri i mbiemrit ose kompanisë kërkohet.");
            RuleFor(x => x.Email).NotEmpty().WithMessage("Emaili kërkohet.")
                .EmailAddress().WithMessage("Emaili nuk është i vlefshëm.");
            RuleFor(x => x.Telefoni).NotEmpty().WithMessage("Telefoni kërkohet.");
        }
    }

    // ================= PROJECT VALIDATOR =================
    public class ProjectCreateUpdateDtoValidator : AbstractValidator<ProjectCreateUpdateDto>
    {
        public ProjectCreateUpdateDtoValidator()
        {
            RuleFor(x => x.Emertimi).NotEmpty().WithMessage("Titulli i projektit kërkohet.");
            RuleFor(x => x.KlientiId).GreaterThan(0).WithMessage("Zgjedhja e klientit kërkohet.");
            RuleFor(x => x.Buxheti).GreaterThanOrEqualTo(0).WithMessage("Buxheti duhet të jetë një numër pozitiv.");
            RuleFor(x => x.DataFillimit).NotEmpty().WithMessage("Data e fillimit kërkohet.");
            
            RuleFor(x => x)
                .Must(x => x.DataPerfundimit == null || x.DataPerfundimit >= x.DataFillimit)
                .WithMessage("Data e përfundimit duhet të jetë pas datës së fillimit.")
                .WithName("DataPerfundimit");
        }
    }

    // ================= WORKER VALIDATOR =================
    public class WorkerCreateUpdateDtoValidator : AbstractValidator<WorkerCreateUpdateDto>
    {
        public WorkerCreateUpdateDtoValidator()
        {
            RuleFor(x => x.Emri).NotEmpty().WithMessage("Emri kërkohet.");
            RuleFor(x => x.Mbiemri).NotEmpty().WithMessage("Mbiemri kërkohet.");
            RuleFor(x => x.Email).NotEmpty().WithMessage("Emaili kërkohet.")
                .EmailAddress().WithMessage("Emaili nuk është i vlefshëm.");
            RuleFor(x => x.Telefoni).NotEmpty().WithMessage("Telefoni kërkohet.");
            RuleFor(x => x.Profesioni).NotEmpty().WithMessage("Profesioni kërkohet.");
            RuleFor(x => x.PagaDitore).GreaterThanOrEqualTo(0).WithMessage("Paga ditore duhet të jetë një numër pozitiv.");
        }
    }
}
