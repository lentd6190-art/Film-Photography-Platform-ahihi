using Microsoft.AspNetCore.Mvc;

namespace CommunityService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "Community Service",
            status = "Healthy"
        });
    }
}