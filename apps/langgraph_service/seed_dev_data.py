#!/usr/bin/env python3
"""Seed 3 days of realistic health data for development testing."""

import os
from datetime import date, timedelta, datetime
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment")
    exit(1)

client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

# ── Find user by email ─────────────────────────────────────────────────────
TARGET_EMAIL = "ganeshmahadev2463@gmail.com"

profile_r = client.table("profiles").select("id, display_name").eq("email", TARGET_EMAIL).single().execute()
if not profile_r.data:
    print(f"No profile found for: {TARGET_EMAIL}")
    exit(1)

user_id = profile_r.data["id"]
name = profile_r.data.get("display_name") or TARGET_EMAIL
print(f"Seeding for: {name} ({user_id})\n")

today = date.today()
days = [(today - timedelta(days=i)).isoformat() for i in range(3)]  # [today, yesterday, day-before]

# ── Cleanup previous seed runs ─────────────────────────────────────────────
print("Cleaning up previous seed data...")
for d in days:
    client.table("water_logs").delete().eq("user_id", user_id).eq("date", d).execute()
    client.table("sleep_logs").delete().eq("user_id", user_id).eq("date", d).execute()
    client.table("activity_logs").delete().eq("user_id", user_id).eq("date", d).execute()
    client.table("weight_logs").delete().eq("user_id", user_id).eq("date", d).execute()
    # meal_items cascade from meal_logs, so delete meal_logs
    meal_ids_r = client.table("meal_logs").select("id").eq("user_id", user_id).eq("date", d).execute()
    if meal_ids_r.data:
        for m in meal_ids_r.data:
            client.table("meal_items").delete().eq("meal_log_id", m["id"]).execute()
    client.table("meal_logs").delete().eq("user_id", user_id).eq("date", d).execute()

# Clean up seeded foods
seeded_food_names = [
    "Oats with milk", "Chicken rice bowl", "Scrambled eggs", "Garden salad",
    "Pasta bolognese", "Tuna sandwich", "Grilled steak with veg",
]
client.table("foods").delete().eq("created_by", user_id).in_("name", seeded_food_names).execute()
print("  Done.\n")

# ── Create foods ───────────────────────────────────────────────────────────
foods_data = [
    {"name": "Oats with milk",          "calories_per_100g": 150, "protein_g": 5,  "carb_g": 25, "fat_g": 3,  "created_by": user_id},
    {"name": "Chicken rice bowl",       "calories_per_100g": 140, "protein_g": 12, "carb_g": 18, "fat_g": 4,  "created_by": user_id},
    {"name": "Scrambled eggs",          "calories_per_100g": 150, "protein_g": 10, "carb_g": 1,  "fat_g": 11, "created_by": user_id},
    {"name": "Garden salad",            "calories_per_100g":  80, "protein_g": 3,  "carb_g": 10, "fat_g": 4,  "created_by": user_id},
    {"name": "Pasta bolognese",         "calories_per_100g": 160, "protein_g": 8,  "carb_g": 22, "fat_g": 5,  "created_by": user_id},
    {"name": "Tuna sandwich",           "calories_per_100g": 200, "protein_g": 12, "carb_g": 22, "fat_g": 7,  "created_by": user_id},
    {"name": "Grilled steak with veg",  "calories_per_100g": 180, "protein_g": 25, "carb_g": 8,  "fat_g": 8,  "created_by": user_id},
]

food_ids: dict[str, str] = {}
print("Creating foods...")
for f in foods_data:
    r = client.table("foods").insert(f).execute()
    if r.data:
        food_ids[f["name"]] = r.data[0]["id"]
        print(f"  + {f['name']}")
    else:
        print(f"  ! Failed to create food: {f['name']}")

# ── Day definitions ────────────────────────────────────────────────────────
seed_days = [
    {
        "date": days[0],
        "water_ml": [500, 600, 400, 250],          # total 1750 ml
        "sleep": {"duration_minutes": 420, "subjective_quality": 7,
                  "bed_time": "23:00:00", "wake_time": "06:00:00"},
        "activity": [{"activity_type": "walking", "duration_minutes": 30,
                      "calories_burned": 180, "intensity_label": "low"}],
        "meals": [
            {"meal_type": "breakfast", "items": [
                {"food": "Oats with milk",     "quantity_g": 250,
                 "calories_total": 375, "protein_g_total": 12, "carb_g_total": 62, "fat_g_total": 8},
            ]},
            {"meal_type": "lunch", "items": [
                {"food": "Chicken rice bowl",  "quantity_g": 400,
                 "calories_total": 560, "protein_g_total": 48, "carb_g_total": 72, "fat_g_total": 16},
            ]},
        ],
        "weight_kg": 75.5,
    },
    {
        "date": days[1],
        "water_ml": [500, 600, 500, 400],          # total 2000 ml
        "sleep": {"duration_minutes": 390, "subjective_quality": 6,
                  "bed_time": "23:45:00", "wake_time": "06:30:00"},
        "activity": [{"activity_type": "running", "duration_minutes": 45,
                      "calories_burned": 420, "intensity_label": "moderate"}],
        "meals": [
            {"meal_type": "breakfast", "items": [
                {"food": "Scrambled eggs",     "quantity_g": 200,
                 "calories_total": 300, "protein_g_total": 20, "carb_g_total": 2,  "fat_g_total": 22},
            ]},
            {"meal_type": "lunch", "items": [
                {"food": "Garden salad",       "quantity_g": 350,
                 "calories_total": 280, "protein_g_total": 10, "carb_g_total": 35, "fat_g_total": 14},
            ]},
            {"meal_type": "dinner", "items": [
                {"food": "Pasta bolognese",    "quantity_g": 450,
                 "calories_total": 720, "protein_g_total": 36, "carb_g_total": 99, "fat_g_total": 22},
            ]},
        ],
        "weight_kg": 75.8,
    },
    {
        "date": days[2],
        "water_ml": [750, 750, 500, 500],          # total 2500 ml
        "sleep": {"duration_minutes": 480, "subjective_quality": 8,
                  "bed_time": "22:30:00", "wake_time": "06:30:00"},
        "activity": [],                             # rest day
        "meals": [
            {"meal_type": "lunch", "items": [
                {"food": "Tuna sandwich",      "quantity_g": 220,
                 "calories_total": 440, "protein_g_total": 26, "carb_g_total": 48, "fat_g_total": 15},
            ]},
            {"meal_type": "dinner", "items": [
                {"food": "Grilled steak with veg", "quantity_g": 380,
                 "calories_total": 684, "protein_g_total": 95, "carb_g_total": 30, "fat_g_total": 30},
            ]},
        ],
        "weight_kg": 75.6,
    },
]

# ── Insert data ────────────────────────────────────────────────────────────
for day in seed_days:
    d = day["date"]
    print(f"\n── {d} ──")

    # Water
    for i, ml in enumerate(day["water_ml"]):
        client.table("water_logs").insert({
            "user_id": user_id, "date": d, "amount_ml": ml,
            "logged_at": f"{d}T{8 + i * 2:02d}:00:00+00:00",
        }).execute()
    print(f"  Water:    {sum(day['water_ml'])} ml ({len(day['water_ml'])} entries)")

    # Sleep
    sl = day["sleep"]
    r = client.table("sleep_logs").insert({
        "user_id": user_id, "date": d,
        "bed_time": sl["bed_time"], "wake_time": sl["wake_time"],
        "subjective_quality": sl["subjective_quality"],
    }).execute()
    if r.data:
        mins = r.data[0].get("duration_minutes") or sl["duration_minutes"]
        print(f"  Sleep:    {mins / 60:.1f}h, quality {sl['subjective_quality']}/10")
    else:
        print(f"  Sleep:    insert failed — {r}")

    # Activity
    for act in day["activity"]:
        client.table("activity_logs").insert({"user_id": user_id, "date": d, **act}).execute()
    if day["activity"]:
        names = ", ".join(a["activity_type"] for a in day["activity"])
        print(f"  Activity: {names}")
    else:
        print(f"  Activity: rest day")

    # Meals + items
    for meal in day["meals"]:
        mr = client.table("meal_logs").insert({
            "user_id": user_id, "date": d, "meal_type": meal["meal_type"],
        }).execute()
        if not mr.data:
            print(f"  Meal:     failed to create {meal['meal_type']} log")
            continue
        meal_log_id = mr.data[0]["id"]
        for item in meal["items"]:
            fid = food_ids.get(item["food"])
            if not fid:
                print(f"  Meal:     food '{item['food']}' not found, skipping")
                continue
            client.table("meal_items").insert({
                "meal_log_id": meal_log_id,
                "food_id": fid,
                "quantity_g": item["quantity_g"],
                "calories_total": item["calories_total"],
                "protein_g_total": item["protein_g_total"],
                "carb_g_total": item["carb_g_total"],
                "fat_g_total": item["fat_g_total"],
            }).execute()
        print(f"  Meal:     {meal['meal_type']}")

    # Weight (upsert to handle unique date constraint)
    client.table("weight_logs").upsert({
        "user_id": user_id, "date": d, "weight_kg": day["weight_kg"],
    }, on_conflict="user_id,date").execute()
    print(f"  Weight:   {day['weight_kg']} kg")

print("\n✓ Done! Now trigger insight generation:")
print(f"  POST /api/insights/generate  {{\"category\": \"daily_gist\"}}")
