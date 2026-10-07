using Microsoft.AspNetCore.Mvc;

namespace ResourceService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "Resource Service",
            status = "Healthy"
        });
    }
}