# frozen_string_literal: true

module DashboardHelper
  def calculate_hours_from(tracks)
    seconds_sum = tracks.reduce(0) { |seconds, track| seconds + distance_of_time_in_words_hash(track.from, track.to, accumulate_on: :seconds)[:seconds] }
    distance_of_time_in_words(Time.now, Time.now + seconds_sum, true, accumulate_on: :hours)
  end

  def week_title(date)
    current_week = Time.zone.today.beginning_of_week
    last_week = current_week - 1.week
    date_start_week = date.beginning_of_week.strftime "%d %b"
    date_end_week = date.end_of_week.strftime "%d %b %Y"

    return "Esta semana" if date_in_week? date, current_week
    return "Semana previa" if date_in_week? date, last_week
    return "#{date_start_week} - #{date_end_week}"
  end

  private

  def date_in_week?(date, week)
    date.between? week.beginning_of_week, week.end_of_week
  end
end
