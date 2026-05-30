using Microsoft.AspNetCore.Identity;

namespace backend.Entities
{
    public class ApplicationRole : IdentityRole<int>
    {
        public bool IsActive { get; set; } = true;
        public bool IsAdmin { get; set; } = false;

        public ApplicationRole() : base() { }
        public ApplicationRole(string roleName) : base(roleName) { }
    }
}
