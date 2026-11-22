namespace StoryPageFrontend.Models;

public class Story
{
    public long Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Picture { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;
}
