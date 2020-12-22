module Analytics exposing (..)

import Dict
import Http
import Json.Decode as Decode exposing (Decoder, dict, field, int, string, succeed)
import Json.Decode.Pipeline exposing (required)
import Url.Builder


type alias Model =
    { retention_rate : Dict.Dict String Int
    , active_users : Dict.Dict String Int
    , active_guests : Dict.Dict String Int
    , new_users : Dict.Dict String Int
    , invoice_feature : Dict.Dict String Int
    , project_invitation_feature : Dict.Dict String Int
    , projects_created : Dict.Dict String Int
    , invoices_created : Dict.Dict String Int
    , project_invitations : Dict.Dict String Int
    }


decoder : Decoder Model
decoder =
    Decode.succeed Model
        |> required "retention_rate" (dict int)
        |> required "active_users" (dict int)
        |> required "active_guests" (dict int)
        |> required "new_users" (dict int)
        |> required "invoice_feature" (dict int)
        |> required "project_invitation_feature" (dict int)
        |> required "projects_created" (dict int)
        |> required "invoices_created" (dict int)
        |> required "project_invitations" (dict int)


getAnalytics : (Result Http.Error Model -> msg) -> Cmd msg
getAnalytics msg =
    Http.get
        { url =
            Url.Builder.absolute
                [ "analytics.json" ]
                []
        , expect = Http.expectJson msg decoder
        }
