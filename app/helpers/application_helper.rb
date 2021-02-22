# frozen_string_literal: true

module ApplicationHelper
  def humanized_money_with_currency(amount, currency)
    humanized_money_with_symbol(Money.new(amount * 100, currency))
  end

  # TODO
  # Clean it up to directly use javascript_include_tag
  # or at least, use append the default path
  # used by webpacker so views don't need to
  # get updated.
  def javascript_pack_tag(name)
    javascript_include_tag(name)
  end

  # Includes the style and javascript
  # of a react component located in component_path.
  # Optionally, a container_id can be passed
  # which is the DOM node used to mount the react component.
  # If no container_id is passed, the component's
  # name will be used.
  #
  # Example:
  # <%= react_component("components/views/view/dashboard", "dashboard_container") %>
  #
  # In the javascript file the component can be mounted with:
  # ReactDOM.render(<Component />, document.getElementById("dashboard_container"))
  def react_component(component_path, container_id = nil)
    component_name = container_id || component_path.rpartition("/").last
    [
      content_tag(:div, "", id: component_name),
      stylesheet_link_tag(component_path),
      javascript_include_tag(component_path)
    ].join.html_safe
  end

  # Same as react_component but intended
  # to be used with views/components located
  # in components/views
  def react_view(view_path, container_id = nil)
    react_component("components/views/#{view_path}", container_id)
  end
end
