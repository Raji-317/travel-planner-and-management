package com.travel.model;

public class AttractionCategory {
    private int categoryId;
    private String name;
    private String iconName;
    private String description;

    public AttractionCategory() {}

    public AttractionCategory(int categoryId, String name, String iconName, String description) {
        this.categoryId = categoryId;
        this.name = name;
        this.iconName = iconName;
        this.description = description;
    }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

